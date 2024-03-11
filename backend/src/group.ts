import { Response, Request, NextFunction } from 'express'
import HTTPError from 'http-errors'
import prisma from '../libs/prisma.ts'
import { saveImage, isVisibleTo, PRIVATE_USER } from '../libs/utils.ts'
import { PythonShell } from 'python-shell'
import { groupSummaryString } from './summary.ts'

/**
 * POST /group/create
 * Creates a new group.
 *
 * @param uId - The id of the user creating the group.
 * @param name - The name of the group.
 * @param description - The description of the group.
 * @param size - The size of the group.
 * @throws {HTTPError} - If params don't meet the requirements
 */
function groupCreate(req: Request, res: Response, next: NextFunction) {
  const { uId, name, description, size } = req.body

  if (uId === undefined || name === undefined) {
    next(HTTPError(400, 'Missing group name'))
  }

  const groupSize = size !== undefined && size ? parseInt(size) : undefined
  prisma.group
    .create({
      data: {
        name: name,
        description: description,
        size: groupSize
      }
    })
    .then(async (group) => {
      // User should be in group they created
      prisma.group
        .update({
          where: { id: group.id },
          data: {
            members: { connect: { id: uId } }
          }
        })
        .then(async () => {
          await updateGroupSkills(group.id)
            .then(() => res.json({ message: `Created group ${group.name}` }))
            .catch((err) => next(HTTPError(400, err)))
        })
        .catch((err) => {
          next(HTTPError(400, err))
        })
    })
    .catch(() => next(HTTPError(400, 'Missing required fields')))
}

/**
 * GET /group/
 * Returns specified group.
 *
 * @param gId - The gId of the group.
 * @returns group - The specified group
 * @throws {HTTPError} - If group doesn't exist
 */
function getGroup(req: Request, res: Response, next: NextFunction) {
  const { gId } = req.query
  prisma.group
    .findUniqueOrThrow({
      where: {
        id: gId as string
      },
      select: {
        name: true,
        description: true,
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            skills: true
          }
        },
        size: true,
        coverPhoto: true,
        project: {
          select: {
            id: true
          }
        },
        skills: true
      }
    })
    .then(async (group) => {
      let groupObj: any = group
      if (!group.skills) {
        groupObj.skills = []
      } else {
        groupObj.skills = JSON.parse(group.skills.replaceAll("'", '"'))
      }
      for (let i = 0; i < group.members.length; i++) {
        if (!(await isVisibleTo(req.body.authUserId, group.members[i].id))) {
          group.members[i] = PRIVATE_USER
        }
        groupObj.members[i].skills = JSON.parse(
          groupObj.members[i].skills.replaceAll("'", '"')
        )
      }
      res.json({ group: groupObj })
    })
    .catch((err) => {
      next(HTTPError(400, 'Group not found'))
    })
}

/**
 * POST /group/join
 * Joins the group.
 *
 * @param uId - The id of the user joining the group.
 * @param gId - The id of the group being joined.
 * @throws {HTTPError} - If group doesn't exist, If no space for members
 */
async function groupJoin(req: Request, res: Response, next: NextFunction) {
  const { uId, gId } = req.body

  await prisma.group
    .findUniqueOrThrow({
      where: { id: gId },
      select: {
        members: true,
        size: true,
        project: {
          select: {
            maxGroupSize: true
          }
        }
      }
    })
    .then((group) => {
      if (
        group.members.length + 1 > group.size ||
        (group.project &&
          group.project.maxGroupSize &&
          group.project.maxGroupSize < group.members.length + 1)
      ) {
        return next(HTTPError(400, 'No more space for new members'))
      }
    })
    .catch(() => next(HTTPError(400, 'Cannot find group')))

  await prisma.group
    .update({
      where: { id: gId },
      data: {
        members: { connect: { id: uId } }
      }
    })
    .then(
      async (group) =>
        await updateGroupSkills(gId)
          .then(() => res.json({ message: `Joined group ${group.name}` }))
          .catch((err) => next(HTTPError(400, err)))
    )
    .catch((err) => next(HTTPError(400, err)))
}

/**
 * POST /group/leave
 * Joins the group.
 *
 * @param uId - The id of the user leaving the group. Guaranteed to be in the group.
 * @param gId - The id of the group being left.
 */
function groupLeave(req: Request, res: Response, next: NextFunction) {
  const { uId, gId } = req.body
  prisma.group
    .update({
      where: { id: gId },
      data: {
        members: { disconnect: { id: uId } }
      },
      select: {
        members: true,
        name: true
      }
    })
    .then(async (group) => {
      if (group.members.length === 0) {
        await prisma.group.delete({ where: { id: gId } })
        res.json({ message: `Left group ${group.name}` })
      } else {
        await updateGroupSkills(gId)
          .then(() => res.json({ message: `Left group ${group.name}` }))
          .catch((err) => next(HTTPError(400, err)))
      }
    })
}

/**
 * PUT /group/updatedescription
 * Update group description.
 *
 * @param gId - The id of the group.
 * @param description - The updated description.
 * @throws {HTTPError} - If group doesn't exist, If the description is undefined
 */
function groupUpdateDescription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { gId, description } = req.body
  if (description === undefined) {
    return next(HTTPError(400, 'Missing description'))
  }

  prisma.group
    .update({
      where: { id: gId },
      data: { description: description }
    })
    .then(() => res.json({ message: 'Group description updated' }))
}

/**
 * PUT /group/updatesize
 * Update group size.
 *
 * @param gId - The id of the group.
 * @param size - The updated size.
 * @throws {HTTPError} - If group doesn't exist, If the size is undefined,
 *                       If the size is smaller than current group
 */
async function groupUpdateSize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { gId, size } = req.body
  if (size === undefined) {
    return next(HTTPError(400, 'Missing size'))
  }

  const size_int = parseInt(size) || null

  if (size_int === null) {
    return next(HTTPError(400, 'Could not parse size to an integer'))
  }

  const group = await prisma.group.findUnique({
    where: { id: gId },
    select: {
      members: {
        select: {
          id: true
        }
      },
      size: true
    }
  })

  if (group!.members.length > size_int) {
    return next(HTTPError(400, 'New group size is too small'))
  }

  prisma.group
    .update({
      where: { id: gId },
      data: { size: size_int }
    })
    .then(() => res.json({ message: 'Group size updated' }))
}

/**
 * PUT /group/setcoverphoto
 * Set group cover photo.
 *
 * @param gId - The id of the group.
 * @param imageUrl - The image source.
 * @param topLeftX - X coordinate.
 * @param topLeftY - Y coordinate.
 * @param width - The desired width.
 * @param height - The desired height.
 * @throws {HTTPError} - If params are undefined, If the image cannot be found
 */
async function groupSetCoverPhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { gId, imageUrl, topLeftX, topLeftY, width, height } = req.body
  if (
    imageUrl === undefined ||
    topLeftX == undefined ||
    topLeftY == undefined ||
    width === undefined ||
    height === undefined
  ) {
    return next(HTTPError(400, 'Missing fields'))
  }

  const x = parseInt(topLeftX)
  const y = parseInt(topLeftY)
  const w = parseInt(width)
  const h = parseInt(height)

  const filePath = await saveImage(imageUrl, x, y, w, h).catch((err) => {
    return next(err)
  })
  if (!filePath) {
    return
  }
  await prisma.group
    .update({
      where: { id: gId },
      data: { coverPhoto: filePath! }
    })
    .then(() => res.json({ imagePath: filePath }))
}

/**
 * PUT /group/updatename
 * Update group name.
 *
 * @param gId - The id of the group.
 * @param name - The updated name
 * @throws {HTTPError} - If params are undefined, If the image cannot be found
 */
function groupUpdateName(req: Request, res: Response, next: NextFunction) {
  const { gId, name } = req.body
  if (!name) {
    return next(HTTPError(400, 'Missing name'))
  }
  prisma.group
    .update({
      where: { id: gId },
      data: { name: name }
    })
    .then(() => res.json({ message: 'Group name updated' }))
}

/**
 * POST /group/joinproject
 * Join a project.
 *
 * @param gId - The id of the group.
 * @param pId - The id of the project
 * @throws {HTTPError} - If params are undefined, If the project doesn't exist,
 *                       If project and group size are not compatible
 */
async function groupJoinProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { gId, pId } = req.body
  if (gId === undefined || pId === undefined) {
    return next(HTTPError(400, 'Missing fields'))
  }

  const project = await prisma.project.findUnique({
    where: { id: pId },
    select: {
      maxGroupCount: true,
      minGroupSize: true,
      maxGroupSize: true,
      groups: true
    }
  })

  if (project === null) {
    return next(HTTPError(400, 'Project not found'))
  }

  const group = await prisma.group.findUnique({
    where: { id: gId },
    select: { members: true, size: true }
  })

  if (group!.members.length !== group!.size) {
    return next(HTTPError(400, 'Group is not full'))
  }

  if (
    project.maxGroupCount !== null &&
    project.groups.length + 1 > project.maxGroupCount
  ) {
    return next(HTTPError(400, 'Max group count exceeded'))
  }

  if (project.minGroupSize !== null && project.minGroupSize > group!.size) {
    return next(HTTPError(400, 'Group size too small for project'))
  }

  if (project.maxGroupSize !== null && project.maxGroupSize < group!.size) {
    return next(HTTPError(400, 'Group size too big for project'))
  }

  prisma.group
    .update({
      where: { id: gId },
      data: {
        projectId: pId
      }
    })
    .then(() => {
      res.json({
        message: 'Project joined by group'
      })
    })
    .catch((err) => {
      next(HTTPError(400, err))
    })
}

/**
 * GET /groups/all
 * Get all groups
 *
 * @returns groups - All groups
 */
function groupsGetAll(req: Request, res: Response, next: NextFunction) {
  prisma.group
    .findMany({
      select: {
        id: true,
        name: true,
        description: true,
        members: {
          select: {
            id: true
          }
        },
        size: true,
        coverPhoto: true,
        project: {
          select: {
            id: true
          }
        }
      }
    })
    .then((groups) => {
      res.json({ groups: groups })
    })
}

/**
 * GET /groups/byproject
 * Gets all groups which are doing the given project.
 *
 * @param pId - The id of the project
 * @returns groups - All groups doing the project
 */
function groupsGetByProject(req: Request, res: Response, next: NextFunction) {
  const { pId } = req.query
  if (pId === undefined) {
    return next(HTTPError(400, 'Missing project id'))
  }
  prisma.group
    .findMany({
      where: { projectId: pId as string },
      select: {
        id: true,
        name: true,
        description: true,
        members: {
          select: {
            id: true
          }
        },
        size: true,
        coverPhoto: true
      }
    })
    .then((groups) => {
      res.json({ groups: groups })
    })
}

function groupDelete(req: Request, res: Response, next: NextFunction) {
  const { gId } = req.query
  if (gId === undefined) {
    return next(HTTPError(400, 'Missing group id'))
  }
  prisma.group
    .delete({ where: { id: gId as string } })
    .then(() => res.json({ message: 'Group deleted' }))
    .catch(() => next(HTTPError(400, 'Group not found')))
}

/**
 * GET /group/project/skillgap
 * Gets skillgap between group and project
 *
 * @param gId - Group Id
 * @param pId - Project Id
 * @returns groups - All groups doing the project
 * @throws {HTTPError} - If project doesn't exist
 */
async function groupProjectSkillGap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { gId, pId } = req.query
  const project = await prisma.project
    .findUniqueOrThrow({
      where: {
        id: pId as string
      },
      select: {
        requiredSkills: true
      }
    })
    .catch((err) => {
      return next(HTTPError(400, err))
    })

  if (!project) {
    return next(HTTPError(400, { error: 'No Project found' }))
  }

  let projectRequirements = ''
  project!.requiredSkills.forEach((skill) => {
    projectRequirements += `${skill}___`
  })

  if (!projectRequirements) {
    res.json({ requirements: [] })
    return
  }

  const group = await prisma.group
    .findUniqueOrThrow({
      where: {
        id: gId as string
      },
      select: {
        members: {
          select: {
            degree: true,
            workExperience: true,
            courses: true
          }
        }
      }
    })
    .catch((err) => {
      return next(HTTPError(400, err))
    })

  let groupString = ''
  group!.members.forEach((user) => {
    groupString += `${user.workExperience}___`
    user.courses.forEach((course) => {
      groupString += `${course.title} ${course.summary}___`
    })
  })

  let pyshell = new PythonShell('src/python/skillgap.py')
  pyshell.send(groupString.replaceAll('\n', ''))
  pyshell.send(projectRequirements.replaceAll('\n', ''))
  pyshell.on('message', async (message) => {
    res.json({ requirements: JSON.parse(message.toString().replaceAll("'", '"')) })
  })
  pyshell.end((err) => { if (err) console.log(err) });
}

/**
 * POST /group/invite
 * Group invites user to join group
 *
 * @param uId - User id
 * @param gId - Group id
 * @throws {HTTPError} - If User already invited to group, If Group is full, If User not found,
 * If User already in group
 */
function groupInvite(req: Request, res: Response, next: NextFunction) {
  const { gId, uId } = req.body

  prisma.group
    .findUniqueOrThrow({
      where: { id: gId },
      select: {
        members: true,
        invitedUsers: true,
        userRequests: true,
        size: true
      }
    })
    .then(async (group) => {
      if (group.members.length + 1 > group.size) {
        return next(HTTPError(400, 'No more space for new members'))
      }
      if (group.members.find((user) => user.id === uId)) {
        return next(HTTPError(400, 'User already in group'))
      }
      if (group.invitedUsers.find((user) => user.id === uId)) {
        return next(HTTPError(400, 'User already invited to group'))
      }
      if (group.userRequests.find((user) => user.id === uId)) {
        await prisma.group.update({
          where: { id: gId },
          data: {
            members: { connect: { id: uId } },
            invitedUsers: { disconnect: { id: uId } },
            userRequests: { disconnect: { id: uId } }
          }
        })
        if (group.size === group.members.length + 1) {
          await prisma.group.update({
            where: { id: gId },
            data: {
              userRequests: { set: [] }
            }
          })
        }
        res.json({ message: 'User joined group' })
      } else {
        await prisma.group
          .update({
            where: { id: gId },
            data: {
              invitedUsers: { connect: { id: uId } }
            }
          })
          .then(() => res.json({ message: 'User invited to group' }))
          .catch(() => {
            next(HTTPError(400, 'User not found'))
          })
      }
    })
}

/**
 * DELETE /group/uninvite
 * Group uninvites user to join group
 *
 * @param uId - User id
 * @param gId - Group id
 * @throws {HTTPError} - If User is not invited to group
 */
async function groupUninvite(req: Request, res: Response, next: NextFunction) {
  const { gId, uId } = req.query

  prisma.group
    .findUniqueOrThrow({
      where: { id: gId as string },
      select: {
        invitedUsers: true
      }
    })
    .then((group) => {
      if (!group.invitedUsers.find((user) => user.id === uId)) {
        return next(HTTPError(400, 'User not invited to group'))
      }
      prisma.group
        .update({
          where: { id: gId as string },
          data: {
            invitedUsers: { disconnect: { id: uId as string } }
          }
        })
        .then(() => res.json({ message: 'User uninvited from group' }))
    })
}

/**
 * DELETE /group/request/reject
 * Group rejects user request to join group
 *
 * @param uId - User id
 * @param gId - Group id
 * @throws {HTTPError} - If User did not request to join
 */
function groupRequestReject(req: Request, res: Response, next: NextFunction) {
  const { gId, uId } = req.query
  prisma.group
    .findUniqueOrThrow({
      where: { id: gId as string },
      select: {
        userRequests: true
      }
    })
    .then((group) => {
      if (!group.userRequests.find((user) => user.id === uId)) {
        return next(HTTPError(400, 'User not requested to join group'))
      }
      prisma.group
        .update({
          where: { id: gId as string },
          data: {
            userRequests: { disconnect: { id: uId as string } }
          }
        })
        .then(() => res.json({ message: 'User request rejected' }))
    })
}

/**
 * GET /group/invites/
 * Gets all users invited by group
 *
 * @param gId - Group id
 * @returns - Users
 */
function groupGetInvites(req: Request, res: Response, next: NextFunction) {
  const { gId } = req.query
  prisma.group
    .findUniqueOrThrow({
      where: { id: gId as string },
      select: {
        invitedUsers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            skills: true
          }
        }
      }
    })
    .then((group) => {
      let invitedUsers: any[] = []
      group.invitedUsers.forEach((user) => {
        let userObj: any = user
        userObj.skills = JSON.parse(user.skills.replaceAll("'", '"'))
        invitedUsers.push(userObj)
      })
      res.json({
        invites: invitedUsers
      })
    })
}

/**
 * GET /group/requests/
 * Gets all users who have requested to join group
 *
 * @param gId - Group id
 * @returns - Users
 */
function groupGetRequests(req: Request, res: Response, next: NextFunction) {
  const { gId } = req.query
  prisma.group
    .findUniqueOrThrow({
      where: { id: gId as string },
      select: {
        userRequests: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            skills: true
          }
        }
      }
    })
    .then((group) => {
      let requestedUsers: any[] = []
      group.userRequests.forEach((user) => {
        let userObj: any = user
        userObj.skills = JSON.parse(user.skills.replaceAll("'", '"'))
        requestedUsers.push(userObj)
      })
      res.json({ requests: requestedUsers })
    })
}

/**
 * GET /groups/recruiting/
 * Gets all groups that the auth user is a member of and the uId user is not
 * invited to.
 *
 * @param uId - User id
 * @returns - Groups
 */
function groupsGetRecruiting(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.group
    .findMany({
      where: {
        members: { some: { id: req.body.authUserId } }
      },
      select: {
        id: true,
        name: true,
        description: true,
        members: {
          select: {
            id: true
          }
        },
        size: true,
        coverPhoto: true,
        project: {
          select: {
            id: true
          }
        },
        invitedUsers: {
          select: { id: true }
        }
      }
    })
    .then((groups) => {
      const result = groups
        .filter((group) => {
          return (
            group.size !== group.members.length &&
            !group.invitedUsers.find((x) => x.id === uId)
          )
        })
        .map((x) => {
          return {
            id: x.id,
            name: x.name,
            description: x.description,
            members: x.members,
            coverPhoto: x.coverPhoto,
            size: x.size,
            project: x.project
          }
        })
      res.json({
        groups: result
      })
    })
}


/**
 * Updates the group skill. Called after a user joins or leaves a group
 * or if users inside the group change their profiles
 *
 * @param gId - Group Id
 */
async function updateGroupSkills(gId: string) {
  const { corpusCount, groupSummary } = await groupSummaryString(gId)
  if (groupSummary) {
    const wordCloudWordCount = 50
    let topN = Math.round(wordCloudWordCount / corpusCount)
    if (topN < 1) topN = 1
    let pyshell = new PythonShell('src/python/keywords.py')
    pyshell.send(topN.toString().replaceAll('\n', ''))
    pyshell.send(groupSummary.replaceAll('\n', ''))
    pyshell.on('message', async (message) => {
      await prisma.group.update({
        where: { id: gId },
        data: { skills: message.toString() }
      })
    })
    pyshell.end((err) => { if (err) console.log(err) })
  } else {
    await prisma.group.update({
      where: { id: gId },
      data: { skills: '[]' }
    })
  }
}

export {
  groupCreate,
  getGroup,
  groupJoin,
  groupLeave,
  groupUpdateDescription,
  groupUpdateSize,
  groupSetCoverPhoto,
  groupJoinProject,
  groupsGetAll,
  groupsGetByProject,
  groupUpdateName,
  groupDelete,
  groupProjectSkillGap,
  groupInvite,
  groupUninvite,
  groupRequestReject,
  groupGetInvites,
  groupGetRequests,
  groupsGetRecruiting,
  updateGroupSkills
}

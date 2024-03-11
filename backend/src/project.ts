import { Response, Request, NextFunction } from 'express'
import { saveImage } from '../libs/utils.ts'
import HTTPError from 'http-errors'
import prisma from '../libs/prisma.ts'

/**
 * POST /project/add
 * Creates a new project.
 *
 * @param title - Project title
 * @param description - Project description
 * @param scope - Project scope
 * @param topics - Project topics
 * @param requiredSkills - Project required skills
 * @param outcomes - Project outcomes
 * @param maxGroupSize - Project maxGroupSize
 * @param minGroupSize - Project minGroupSize
 * @param maxGroupCount - Project maxGroupCount
 * 
 * @throws {HTTPError} - If params don't meet the requirements
 */
function projectAdd(req: Request, res: Response, next: NextFunction) {
  const {
    title,
    description,
    scope,
    topics,
    requiredSkills,
    outcomes,
    maxGroupSize,
    minGroupSize,
    maxGroupCount
  } = req.body

  if (
    title === undefined ||
    description === undefined ||
    topics === undefined ||
    scope === undefined ||
    requiredSkills === undefined ||
    outcomes === undefined
  ) {
    next(HTTPError(400, 'Missing required fields'))
  }

  const maxGS =
    maxGroupSize !== undefined && maxGroupSize ? parseInt(maxGroupSize) : null
  const minGS =
    minGroupSize !== undefined && minGroupSize ? parseInt(minGroupSize) : null
  const maxGC =
    maxGroupCount !== undefined && maxGroupCount
      ? parseInt(maxGroupCount)
      : null

  if (maxGS && minGS && minGS > maxGS) {
    return next(HTTPError(400, 'Min group size cannot be greater than max'))
  }
  if (isNaN(maxGC!) || isNaN(maxGS!) || isNaN(minGS!)) {
    return next(HTTPError(400, 'Numeric fields must be numbers'))
  }
  if (maxGC && maxGC < 1) {
    return next(HTTPError(400, 'Max group count must be greater than 0'))
  }
  prisma.project
    .create({
      data: {
        title: title,
        description: description,
        topics: topics,
        scope: scope,
        requiredSkills: requiredSkills,
        outcomes: outcomes,
        ownerId: req.body.authUserId,
        maxGroupSize: maxGS,
        minGroupSize: minGS,
        maxGroupCount: maxGC
      }
    })
    .then((project) => res.json({ project: project, pId: project.id }))
    .catch(() => next(HTTPError(400, 'Missing required fields')))
}

/**
 * GET /project/owned
 * Gets owned projects.
 *
 * @param uId - User Id
 * @returns Projects
 */
function projectsOwnedGet(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.project
    .findMany({
      where: { ownerId: uId as string },
      select: {
        id: true,
        title: true,
        description: true,
        topics: true,
        scope: true,
        requiredSkills: true,
        outcomes: true,
        maxGroupSize: true,
        minGroupSize: true,
        maxGroupCount: true,
        coverPhoto: true
      }
    })
    .then((projects) => {
      res.json({ projects: projects })
    })
}

/**
 * PUT /project/settitle
 * Sets project title.
 *
 * @param pId - Project Id
 * @param title - Project title
 * @throws {HTTPError} - If any Params are missing
 */
function projectSetTitle(req: Request, res: Response, next: NextFunction) {
  const { pId, title } = req.body
  if (!title) {
    return next(HTTPError(400, 'Missing title'))
  }
  prisma.project
    .update({
      where: { id: pId as string },
      data: { title: title }
    })
    .then(() => res.json({ message: 'Title updated' }))
}

/**
 * PUT /project/setdescription
 * Sets project description.
 *
 * @param pId - Project Id
 * @param description - Project description
 * @throws {HTTPError} - If any Params are missing
 */
function projectSetDescription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { pId, description } = req.body
  if (!description) {
    return next(HTTPError(400, 'Missing description'))
  }
  prisma.project
    .update({
      where: { id: pId as string },
      data: { description: description }
    })
    .then(() => res.json({ message: 'Description updated' }))
}

/**
 * PUT /project/settopics
 * Sets project topic.
 *
 * @param pId - Project Id
 * @param title - Project topic
 * @throws {HTTPError} - If any Params are missing
 */
function projectSetTopics(req: Request, res: Response, next: NextFunction) {
  const { pId, topics } = req.body
  if (topics === undefined) {
    return next(HTTPError(400, 'Missing topics'))
  }
  prisma.project
    .update({
      where: { id: pId as string },
      data: { topics: topics }
    })
    .then(() => res.json({ message: 'Topics updated' }))
}

/**
 * PUT /project/setscope
 * Sets project scope.
 *
 * @param pId - Project Id
 * @param title - Project scope
 * @throws {HTTPError} - If any Params are missing
 */
function projectSetScope(req: Request, res: Response, next: NextFunction) {
  const { pId, scope } = req.body
  if (!scope) {
    return next(HTTPError(400, 'Missing scope'))
  }
  prisma.project
    .update({
      where: { id: pId as string },
      data: { scope: scope }
    })
    .then(() => res.json({ message: 'Scope updated' }))
}

/**
 * PUT /project/setrequiredskills
 * Sets project required skills.
 *
 * @param pId - Project Id
 * @param title - Project required skills
 * @throws {HTTPError} - If any Params are missing
 */
function projectSetRequiredSkills(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { pId, requiredSkills } = req.body
  if (requiredSkills === undefined) {
    return next(HTTPError(400, 'Missing required skills'))
  }
  prisma.project
    .update({
      where: { id: pId as string },
      data: { requiredSkills: requiredSkills }
    })
    .then(() => res.json({ message: 'Required skills updated' }))
}

/**
 * PUT /project/setoutcomes
 * Sets project outcomes.
 *
 * @param pId - Project Id
 * @param title - Project outcomes
 * @throws {HTTPError} - If any Params are missing
 */
function projectSetOutcomes(req: Request, res: Response, next: NextFunction) {
  const { pId, outcomes } = req.body
  if (outcomes === undefined) {
    return next(HTTPError(400, 'Missing outcomes'))
  }
  prisma.project
    .update({
      where: { id: pId as string },
      data: { outcomes: outcomes }
    })
    .then(() => res.json({ message: 'Outcomes updated' }))
}

/**
 * PUT /project/setgroupsizes
 * Sets project max and min group sizes.
 *
 * @param pId - Project Id
 * @param minGroupSize - Project minimum group size
 * @param maxGroupSize - Project maximum group size
 * @throws {HTTPError} - If any Params are missing, If max or min size is less than 0, If min is less than max
 */
async function projectSetGroupSizes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { pId, minGroupSize, maxGroupSize } = req.body
  if (maxGroupSize === undefined || minGroupSize === undefined) {
    next(HTTPError(400, 'Missing sizes'))
  }
  const maxGS = maxGroupSize ? parseInt(maxGroupSize) : null
  if (maxGS !== null && maxGS < 1) {
    return next(HTTPError(400, 'Max group count must be greater than 0'))
  }

  const minGS = minGroupSize ? parseInt(minGroupSize) : null
  if (minGS !== null && minGS < 1) {
    return next(HTTPError(400, 'Min group count must be greater than 0'))
  }

  if (maxGS && minGS && maxGS < minGS) {
    return next(
      HTTPError(400, 'Cannot set max group size to less than min group size')
    )
  }
  prisma.project
    .update({
      where: { id: pId as string },
      data: { maxGroupSize: maxGS, minGroupSize: minGS }
    })
    .then(() => res.json({ message: 'Max and min group size updated' }))
}

/**
 * PUT /project/setmaxgroupcount
 * Sets project maximum number of groups
 * 
 * @param pId - Project Id
 * @param maxGroupCount - Project maximum group count
 * @throws {HTTPError} - If any Params are missing, If max group count is less than 0
 */
function projectSetMaxGroupCount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { pId, maxGroupCount } = req.body
  if (maxGroupCount === undefined) {
    return next(HTTPError(400, 'Missing max group count'))
  }
  const maxGC = maxGroupCount ? parseInt(maxGroupCount) : null
  if (maxGC !== null && maxGC < 1) {
    return next(HTTPError(400, 'Min group count must be greater than 0'))
  }
  prisma.project
    .update({
      where: { id: pId as string },
      data: { maxGroupCount: maxGC }
    })
    .then(() => res.json({ message: 'Max group count updated' }))
}

/**
 * GET /project
 * Gets specified project
 *
 * @param pId - Project Id
 * @returns Project
 * @throws {HTTPError} - If any Params are missing, If project is not found
 */
function projectGet(req: Request, res: Response, next: NextFunction) {
  const { pId } = req.query
  if (pId === undefined) {
    return next(HTTPError(400, 'Missing project id'))
  }
  prisma.project
    .findUniqueOrThrow({
      where: { id: pId as string },
      select: {
        id: true,
        title: true,
        description: true,
        topics: true,
        scope: true,
        requiredSkills: true,
        outcomes: true,
        maxGroupSize: true,
        minGroupSize: true,
        maxGroupCount: true,
        coverPhoto: true
      }
    })
    .then((project) => {
      project: res.json({ project: project })
    })
    .catch(() => next(HTTPError(400, 'Project not found')))
}

/**
 * GET /projects/all
 * Gets all projects
 *
 * @returns Projects
 */
function projectsGetAll(req: Request, res: Response, next: NextFunction) {
  prisma.project
    .findMany({
      select: {
        id: true,
        title: true,
        description: true,
        topics: true,
        scope: true,
        requiredSkills: true,
        outcomes: true,
        maxGroupSize: true,
        minGroupSize: true,
        maxGroupCount: true,
        coverPhoto: true
      }
    })
    .then((projects) => {
      projects: res.json({ projects: projects })
    })
}

/**
 * DELETE /project
 * Deletes specified project
 *
 * @param pId - Project id
 * @throws {HTTPError} - If any Params are missing, If project is not found
 */
function projectDelete(req: Request, res: Response, next: NextFunction) {
  const { pId } = req.query
  if (pId === undefined) {
    return next(HTTPError(400, 'Missing project id'))
  }
  prisma.project
    .delete({ where: { id: pId as string } })
    .then(() => res.json({ message: 'Project deleted' }))
    .catch(() => next(HTTPError(400, 'Project not found')))
}

/**
 * GET /project/userjoinablegroups
 * Returns groups which user is in which are eligible to join the given project
 *
 * @param uId - User id
 * @param pId - Project id
 * @returns Groups
 * @throws {HTTPError} - If project is not found
 */
async function projectGetUserJoinableGroups(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, pId } = req.query
  const user = await prisma.user.findUnique({
    where: {
      id: uId as string
    },
    select: {
      groups: {
        select: {
          id: true,
          name: true,
          coverPhoto: true,
          members: true,
          size: true
        }
      }
    }
  })

  const project = await prisma.project.findUnique({
    where: { id: pId as string },
    select: {
      maxGroupSize: true,
      minGroupSize: true
    }
  })

  if (project === null) {
    return next(HTTPError(400, 'Project not found'))
  }

  let joinableGroups: object[] = []
  for (let i = 0; i < user!.groups.length; i++) {
    const group = user!.groups[i]
    if (
      (project.maxGroupSize && group.size > project.maxGroupSize) ||
      (project.minGroupSize && group.size < project.minGroupSize) ||
      group.members.length !== group.size
    ) {
      continue
    }
    joinableGroups.push({
      id: group.id,
      name: group.name,
      coverPhoto: group.coverPhoto
    })
  }
  res.json({ groups: joinableGroups })
}

/**
 * GET /project/joinablegroups
 * Returns groups which are eligible to join the given project
 *
 * @param pId - Project id
 * @returns Groups
 */
async function projectGetJoinableGroups(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { pId } = req.query
  const project = await prisma.project.findUnique({
    where: { id: pId as string },
    select: {
      maxGroupSize: true,
      minGroupSize: true
    }
  })

  const groups = await prisma.group.findMany({
    select: {
      id: true,
      name: true,
      coverPhoto: true,
      members: true,
      size: true
    }
  })

  let joinableGroups: object[] = []
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    if (
      (project!.maxGroupSize && group.size > project!.maxGroupSize) ||
      (project!.minGroupSize && group.size < project!.minGroupSize) ||
      group.members.length !== group.size
    ) {
      continue
    }
    joinableGroups.push({
      id: group.id,
      name: group.name,
      coverPhoto: group.coverPhoto
    })
  }
  res.json({ groups: joinableGroups })
}

/**
 * PUT /project/setcoverphoto
 * Sets project cover photo
 *
 * @param pId - Project id
 * @param imageUrl - The image source
 * @param topLeftX - X coordinate
 * @param topLeftY - Y coordinate
 * @param width - The desired width
 * @param height - The desired height
 * @throws {HTTPError} - If params are undefined, If the image cannot be found
*/
async function projectSetCoverPhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { pId, imageUrl, topLeftX, topLeftY, width, height } = req.body
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
  await prisma.project
    .update({
      where: { id: pId },
      data: { coverPhoto: filePath! }
    })
    .then(() => res.json({ imagePath: filePath }))
}

export {
  projectAdd,
  projectsOwnedGet,
  projectSetTitle,
  projectSetDescription,
  projectSetTopics,
  projectSetScope,
  projectSetRequiredSkills,
  projectSetOutcomes,
  projectSetGroupSizes,
  projectSetMaxGroupCount,
  projectDelete,
  projectGet,
  projectsGetAll,
  projectGetUserJoinableGroups,
  projectGetJoinableGroups,
  projectSetCoverPhoto
}

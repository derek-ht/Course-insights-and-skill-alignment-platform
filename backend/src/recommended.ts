import prisma from '../libs/prisma.ts'
import { Response, Request, NextFunction } from 'express'
import HTTPError from 'http-errors'
import { UserType } from '@prisma/client'
import { PythonShell } from 'python-shell';

/**
 * GET /user/recommendedusers
 * Shows recommended users for user
 *
 * @param uId - User id
 */
async function recommendUsersToUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId } = req.query
  const { userString } = await getUserString(uId as string)
  const { usersString } = await getAllUsersString([uId as string])

  if (!usersString) {
    return res.json({ users: [] })
  }

  let pyshell = new PythonShell('src/python/user_recommendations.py')
  pyshell.send(userString.replaceAll('\n', ''))
  pyshell.send(usersString.replaceAll('\n', ''))
  pyshell.on('message', async (message) => {
    const recommendations = JSON.parse(message.toString().replaceAll("'", '"'))
    res.json({ users: await getUserObjects(recommendations) })
  })
  pyshell.end((err) => { if (err) console.log(err) });
}

/**
 * GET /group/recommendedprojects
 * Shows recommended projects for group
 *
 * @param gId - Group id
 */
async function recommendProjectsToGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { gId } = req.query
  const { group, groupString } = await getGroupString(gId as string)

  if (!group) {
    return next(HTTPError(400, 'Group not found'))
  }

  let fields: { projectIds: string[]; size: number }
  if (group.projectId) {
    fields = {
      projectIds: [group.projectId],
      size: group.size
    }
  } else {
    fields = {
      projectIds: [],
      size: group.size
    }
  }

  const { projectsString } = await getAllProjectsString(fields)

  let pyshell = new PythonShell('src/python/project_recommendations.py')
  pyshell.send(groupString.replaceAll('\n', ''))
  pyshell.send(projectsString.replaceAll('\n', ''))
  pyshell.on('message', async (message) => {
    const recommendations = JSON.parse(message.toString().replaceAll("'", '"'))
    res.json({ projects: await getProjectObjects(recommendations) })
  })
  pyshell.end((err) => { if (err) console.log(err) });
}

/**
 * GET /group/recommendedusers
 * Shows recommended projects for group
 *
 * @param gId - Group id
 */
async function recommendUsersToGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { gId } = req.query
  const { group, groupString } = await getGroupString(gId as string)

  if (!group) {
    return next(HTTPError(400, 'Group not found'))
  }

  const { usersString } = await getAllUsersString(
    group.members.map((x) => x.id)
  )

  let pyshell = new PythonShell('src/python/recommendations.py')
  pyshell.send(groupString.replaceAll('\n', ''))
  pyshell.send(usersString.replaceAll('\n', ''))
  pyshell.on('message', async (message) => {
    const recommendations = JSON.parse(message.toString().replaceAll("'", '"'))
    res.json({ users: await getUserObjects(recommendations) })
  })
  pyshell.end((err) => { if (err) console.log(err) });
}

/**
 * GET /group/recommendedusers
 * Shows recommended groups to user
 *
 * @param gId - Group id
 */
async function recommendGroupsToUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId } = req.query
  const { userString } = await getUserString(uId as string)
  const { groupsString } = await getAllGroupsString(uId as string)

  let pyshell = new PythonShell('src/python/recommendations.py')
  pyshell.send(userString.replaceAll('\n', ''))
  pyshell.send(groupsString.replaceAll('\n', ''))
  pyshell.on('message', async (message) => {
    const recommendations = JSON.parse(message.toString().replaceAll("'", '"'))
    res.json({ groups: await getGroupObjects(recommendations) })
  })
  pyshell.end((err) => { if (err) console.log(err) });
}

/**
 * GET /user/recommendedprojects
 * Shows recommended projects to user
 *
 * @param uId - User id
 */
async function recommendProjectsToUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId } = req.query
  const { user, userString } = await getUserString(uId as string)
  let userProjects: string[] = []
  user?.groups.forEach((group) => {
    if (group.projectId) {
      userProjects.push(group.projectId)
    }
  })
  const { projectsString } = await getAllProjectsString({
    projectIds: userProjects,
    size: null
  })

  let pyshell = new PythonShell('src/python/recommendations.py')
  pyshell.send(userString.replaceAll('\n', ''))
  pyshell.send(projectsString.replaceAll('\n', ''))
  pyshell.on('message', async (message) => {
    const recommendations = JSON.parse(message.toString().replaceAll("'", '"'))
    res.json({ projects: await getProjectObjects(recommendations) })
  })
  pyshell.end((err) => { if (err) console.log(err) });
}

/**
 * Returns a string containing user degree, work experience and courses
 *
 * @param uId - User id
 * @returns {string} - User string consisting of their degree, courses and work experience
 */
async function getUserString(uId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: uId
    },
    select: {
      degree: true,
      courses: true,
      workExperience: true,
      groups: {
        select: {
          projectId: true
        }
      }
    }
  })

  if (user === null) {
    return { user: user, userString: '' }
  }

  let userString = ''
  userString +=
    `Id:${uId}|` +
    `user degree:${user!.degree}|` +
    `user workexperience:${user!.workExperience}|` +
    'user courses:'
  user!.courses.forEach((course) => {
    userString += `${course.title} ${course.summary} `
  })
  return { user: user, userString: userString }
}

/**
 * Determines whether the uId is inside every array of visibleUsers
 *
 * @param uIds - User id
 * @param visibleUsers - An array of arrays containing uIds
 * @returns Bool
 */
function isInEveryArray(uId: string, visibleUsers: string[][]) {
  for (let i = 0; i < visibleUsers.length; i++) {
    if (!visibleUsers[i].includes(uId)) {
      return false
    }
  }
  return true
}

/**
 * Returns a string containing the degree, work experience and courses of all visible users
 *
 * @param uIds - Ids of users who the user profiles should be visible to
 * @returns {string} - String consisting of the degree, courses and work experience of all visible users
 */
async function getAllUsersString(uIds: string[]) {
  const users = await prisma.user.findMany({
    where: {
      type: UserType.STUDENT
    },
    select: {
      id: true,
      degree: true,
      courses: true,
      workExperience: true,
      public: true
    }
  })

  let sharedWithAll: string[][] = []
  for (let i = 0; i < uIds.length; i++) {
    let sharedWith: string[] = []
    const user = await prisma.user.findUnique({
      where: {
        id: uIds[i]
      },
      select: {
        sharedProfiles: {
          select: {
            profileOwnerId: true
          }
        }
      }
    })
    user!.sharedProfiles.forEach((shared) => {
      sharedWith.push(shared.profileOwnerId)
    })
    sharedWithAll.push(sharedWith)
  }

  let usersString = ''
  users.forEach((user_) => {
    if (
      !uIds.includes(user_.id) &&
      (user_.public || isInEveryArray(user_.id, sharedWithAll))
    ) {
      usersString +=
        `Id:${user_.id}|` +
        `user degree:${user_.degree}|` +
        `user workexperience:${user_.workExperience}|` +
        'user courses:'
      user_.courses.forEach((course) => {
        usersString += `${course.title} ${course.summary} `
      })
      usersString += '___'
    }
  })
  return { usersString: usersString }
}

/**
 * Returns a string containing the degree, work experience and courses of each member of group
 *
 * @param gId - Group id
 * @returns {string} - String consisting of the degree, courses and work experience of all group members
 */
async function getGroupString(gId: string) {
  const group = await prisma.group.findUnique({
    where: {
      id: gId
    },
    select: {
      members: {
        select: {
          id: true,
          degree: true,
          workExperience: true,
          courses: true
        }
      },
      projectId: true,
      size: true
    }
  })

  if (group === null) {
    return { group: group, groupString: '' }
  }

  let groupString = ''
  group!.members.forEach((user) => {
    groupString += `${user.degree} ${user.workExperience} `
    user.courses.forEach((course) => {
      groupString += `${course.title} ${course.summary} `
    })
  })
  return { group: group, groupString: groupString }
}

/**
 * Returns a string containing the degree, work experience and courses of each member of all groups
 * where all members of the group are visible to the provided user.
 *
 * @param uId - User id
 * @returns {string} - String consisting of the degree, courses and work experience of all group members
 * where all members of the group are visible to the provided user.
 */
async function getAllGroupsString(uId: string) {
  const groups = await prisma.group.findMany({
    select: {
      id: true,
      members: {
        select: {
          id: true,
          degree: true,
          workExperience: true,
          courses: true,
          public: true,
          sharedWithUsers: {
            select: {
              sharedWithId: true
            }
          }
        }
      },
      size: true
    }
  })

  let groupsString = ''
  groups.forEach((group) => {
    let visibleUsers: string[][] = []
    group.members.forEach((member) => {
      if (!member.public) {
        visibleUsers.push(member.sharedWithUsers.map((x) => x.sharedWithId))
      }
    })
    if (
      group.members.length + 1 <= group.size &&
      !group.members.map((x) => x.id).includes(uId) &&
      isInEveryArray(uId, visibleUsers)
    ) {
      groupsString += `Id:${group.id}|`
      group!.members.forEach((user) => {
        groupsString += `${user.degree} ${user.workExperience} `
        user.courses.forEach((course) => {
          groupsString += `${course.title} ${course.summary} `
        })
      })
      groupsString += '___'
    }
  })
  return { groupsString: groupsString }
}

/**
 * Returns a string containing the topic, description and skills of all projects excluding projects which
 * are specified in the params.
 *
 * @param projectIds - List of project ids which should be excluded
 * @returns {string} - String containing the topic, description and skills of all projects excluding projects which
 * are specified in the params.
 */
async function getAllProjectsString(fields: {
  projectIds: string[]
  size: number | null
}) {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      topics: true,
      description: true,
      requiredSkills: true,
      maxGroupSize: true,
      minGroupSize: true,
      maxGroupCount: true,
      groups: true
    }
  })

  let projectsString = ''
  projects.forEach((project) => {
    if (
      !(
        fields.projectIds.includes(project.id) ||
        (fields.size &&
          ((project.maxGroupSize && project.maxGroupSize < fields.size) ||
            (project.minGroupSize && project.minGroupSize > fields.size))) ||
        (project.maxGroupCount &&
          project.maxGroupCount < project.groups.length + 1)
      )
    ) {
      projectsString += `Id:${project.id}|Topics__`
      project.topics.forEach((topic) => {
        projectsString += `${topic} `
      })
      projectsString += '|Skills__'
      project.requiredSkills.forEach((skill) => {
        projectsString += `${skill} `
      })
      projectsString += '|Description__'
      projectsString += `${project.description}|___`
    }
  })
  return { projectsString: projectsString }
}

/**
 * Converts an array of uIds into an array of user objects
 *
 * @param recommendations - List of user ids
 * @returns Users
 */
async function getUserObjects(recommendations: any) {
  let recommendedUsers: object[] = []
  for (let i = 0; i < recommendations.length; i++) {
    let user = await prisma.user.findUnique({
      where: {
        id: recommendations[i]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        school: true,
        degree: true,
        avatar: true,
        courses: true,
        workExperience: true,
        groups: true,
        skills: true
      }
    })
    if (user) {
      let userObj: any = user
      if (!user.skills) {
        userObj.skills = []
      } else {
        userObj.skills = JSON.parse(user.skills.replaceAll("'", '"'))
      }
      recommendedUsers.push(userObj)
    }
  }
  return recommendedUsers
}

/**
 * Converts an array of gIds into an array of user objects
 *
 * @param recommendations - List of group ids
 * @returns Groups
 */
async function getGroupObjects(recommendations: any) {
  let recommendedGroups: object[] = []
  for (let i = 0; i < recommendations.length; i++) {
    let group = await prisma.group.findUnique({
      where: {
        id: recommendations[i]
      },
      select: {
        id: true,
        name: true,
        description: true,
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true
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
    if (group) {
      let groupObj: any = group
      if (!group.skills) {
        groupObj.skills = []
      } else {
        groupObj.skills = JSON.parse(group.skills.replaceAll("'", '"'))
      }
      recommendedGroups.push(groupObj)
    }
  }
  return recommendedGroups
}

/**
 * Converts an array of uIds into an array of project objects
 *
 * @param recommendations - List of project ids
 * @returns Projects
 */
async function getProjectObjects(recommendations: any) {
  let recommendedProjects: object[] = []
  for (let i = 0; i < recommendations.length; i++) {
    let project = await prisma.project.findUnique({
      where: {
        id: recommendations[i]
      },
      select: {
        id: true,
        title: true,
        description: true,
        coverPhoto: true,
        topics: true,
        scope: true,
        requiredSkills: true,
        outcomes: true,
        maxGroupSize: true,
        minGroupSize: true,
        maxGroupCount: true
      }
    })
    if (project) {
      recommendedProjects.push(project)
    }
  }
  return recommendedProjects
}

export {
  recommendUsersToUser,
  recommendProjectsToGroup,
  recommendUsersToGroup,
  recommendGroupsToUser,
  recommendProjectsToUser
}

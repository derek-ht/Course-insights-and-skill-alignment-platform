import request from 'supertest'
import { expect } from 'vitest'
import { app } from '../index.ts'
import { createJWT, createPassword } from '../../libs/utils.ts'
import { UnverifiedUser, UserType } from '@prisma/client'
import prisma from '../../libs/prisma.ts'

function login(email: string, password: string) {
  return request(app)
    .post('/auth/login')
    .send({
      email: email,
      password: password
    })
    .expect(200)
    .expect((res) => {
      expect(res.body).toHaveProperty('uId')
      expect(typeof res.body.uId).toBe('string')
    })
}

async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  type: UserType
) {
  const { salt, hash } = createPassword(password)
  return prisma.user
    .create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        pwHash: hash,
        pwSalt: salt,
        type: type,
        workExperience: []
      }
    })
    .then((user) => user.id)
}

async function createCourse(code: string, year: string, ownerId: string) {
  const course = await prisma.course.create({
    data: {
      code: code,
      year: year,
      title: 'title',
      summary: 'summary',
      owner: { connect: { id: ownerId } }
    }
  })
  return course.id
}

async function createGroup(name: string, uId: string) {
  const group = await prisma.group.create({
    data: {
      name: name,
      description: 'We love scrumming',
      size: 2,
      members: { connect: { id: uId } }
    }
  })
  return group.id
}

async function createProjectShort(
  title: string,
  ownerId: string,
  description: string
) {
  const project = await prisma.project.create({
    data: {
      title: title,
      description: description,
      ownerId: ownerId,
      scope: 'This is the scope of the project',
      topics: ['test topic'],
      requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
      outcomes: ['Documentation', 'Testing', 'Web Application']
    }
  })
  return project.id
}

async function createGroupWithFields(
  uId: string,
  fields: { name; description; size }
) {
  const { name, description, size } = fields
  const group = await prisma.group.create({
    data: {
      name: name,
      description: description,
      size: size,
      members: { connect: { id: uId } }
    }
  })
  return group.id
}

async function createProject(
  projectFields: {
    title
    description
    scope
    topics
    requiredSkills
    outcomes
    maxGroupSize
    minGroupSize
    maxGroupCount
  },
  uId: string
) {
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
  } = projectFields
  const project = await prisma.project.create({
    data: {
      title: title,
      description: description,
      topics: topics,
      scope: scope,
      requiredSkills: requiredSkills,
      outcomes: outcomes,
      ownerId: uId,
      maxGroupSize: maxGroupSize,
      minGroupSize: minGroupSize,
      maxGroupCount: maxGroupCount
    }
  })
  return project.id
}

async function getProjectFromGroup(gId: string) {
  const group = await prisma.group.findUnique({
    where: {
      id: gId
    },
    select: {
      projectId: true
    }
  })
  return group?.projectId
}

async function getCoursesFromUser(uId: string) {
  const user = await prisma.user.findUnique({
    where: { id: uId },
    select: {
      courses: {
        select: {
          code: true,
          year: true
        }
      }
    }
  })
  return user?.courses
}
async function togglevisibility(uId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: uId },
    select: { public: true }
  })
  await prisma.user.update({
    where: { id: uId },
    data: { public: !user.public }
  })
}

async function joinGroup(gId: string, uId: string) {
  await prisma.group.update({
    where: { id: gId },
    data: { members: { connect: { id: uId } } }
  })
}

async function requestJoinGroup(gId: string, uId: string) {
  await prisma.group.update({
    where: { id: gId },
    data: { userRequests: { connect: { id: uId } } }
  })
}

async function inviteUserToGroup(gId: string, uId: string) {
  await prisma.group.update({
    where: { id: gId },
    data: { invitedUsers: { connect: { id: uId } } }
  })
}

async function getEmailVerificationToken(email: string) {
  const unverifiedUser = await prisma.unverifiedUser.findUniqueOrThrow({
    where: { email: email }
  })
  return createJWT(unverifiedUser)
}

async function getPasswordResetToken(email: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: email }
  })
  return createJWT(user)
}

export {
  login,
  register,
  createCourse,
  createGroup,
  createGroupWithFields,
  createProject,
  getProjectFromGroup,
  createProjectShort,
  getCoursesFromUser,
  togglevisibility,
  joinGroup,
  requestJoinGroup,
  inviteUserToGroup,
  getEmailVerificationToken,
  getPasswordResetToken
}

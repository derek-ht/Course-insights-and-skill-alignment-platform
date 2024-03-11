globalThis.jest = vi
import { beforeEach, vi } from 'vitest'
import { Prisma, PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import createPrismaMock from 'prisma-mock'
import { select } from 'async'
import { group } from 'console'

const prisma: any = await createPrismaMock({}, Prisma.dmmf.datamodel)

const userUpdate = prisma.user.update.getMockImplementation()
const courseCreate = prisma.course.create.getMockImplementation()
const sharedProfileCreate = prisma.sharedProfile.create.getMockImplementation()
const groupUpdate = prisma.group.update.getMockImplementation()

// Mock Implementations to rectify missing or bugged behaviours from prisma-mock

/**
 * prisma.user.update
 *
 * @throws if the user cannot be found
 */
prisma.user.update.mockImplementation(async (options) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: options.where,
    select: { sharedWithUsers: true }
  })
  return await userUpdate(options)
})

/**
 * prisma.sharedProfile.create
 *
 * @throws if the shared profile already exists
 * @throws if the profile owner or shared with user cannot be found
 * @throws if the shared with user is already shared with
 *
 */
prisma.sharedProfile.create.mockImplementation(async (options) => {
  const profileOwnerId = options.data.profileOwner.connect.id
  const sharedWithEmail = options.data.sharedWith.connect.email
  const sharedWithId =
    options.data.sharedWith.connect.id ||
    (await prisma.user.findUnique({ where: { email: sharedWithEmail } })).id
  await prisma.user.findUniqueOrThrow({
    where: { id: profileOwnerId }
  })
  await prisma.user.findUniqueOrThrow({
    where: { id: sharedWithId }
  })
  const sharedProfile = await prisma.sharedProfile.findUnique({
    where: {
      profileOwnerId_sharedWithId: {
        profileOwnerId,
        sharedWithId
      }
    }
  })
  if (sharedProfile) {
    throw new Error('Shared profile already exists')
  }
  return sharedProfileCreate(options)
})

/**
 * prisma.course.create
 *
 * @throws if the course already exists
 */
prisma.course.create.mockImplementation(async (options) => {
  const { data, select, include } = options
  const course = await prisma.course.findUnique({
    where: {
      code_year: { code: data.code, year: data.year }
    }
  })
  if (course) {
    throw new Error('Course already exists')
  } else {
    return courseCreate(options)
  }
})

/**
 * prisma.group.update
 *
 * If the user is being invited to join the group, check that the user exists
 * If the user is being removed from the group, check that the user exists and
 *  remove the user from the invitedUsers list
 * If the user is requesting to join the group, check that the user exists and
 *  that the user has not already requested to join the group
 * If the user is cancelling their request to join the group, check that the
 *  user exists and remove the user from the userRequests list
 */
prisma.group.update.mockImplementation(async (options) => {
  if (
    options.data &&
    options.data.invitedUsers &&
    options.data.invitedUsers.connect &&
    options.data.invitedUsers.connect.id
  ) {
    await prisma.user.findUniqueOrThrow({
      where: { id: options.data.invitedUsers.connect.id }
    })
  } else if (
    options.where.id &&
    options.data &&
    options.data.invitedUsers &&
    options.data.invitedUsers.disconnect &&
    options.data.invitedUsers.disconnect.id
  ) {
    await prisma.user.findUniqueOrThrow({
      where: { id: options.data.invitedUsers.disconnect.id }
    })
    let invitedUsers = await prisma.group
      .findUniqueOrThrow({
        where: { id: options.where.id },
        select: { invitedUsers: true }
      })
      .then((group) =>
        group.invitedUsers.filter(
          (user) => user.id !== options.data.invitedUsers.disconnect.id
        )
      )
    groupUpdate({
      where: { id: options.where.id },
      data: { invitedUsers: { set: invitedUsers } }
    })
  } else if (
    options.where.id &&
    options.data.userRequests &&
    options.data.userRequests.connect &&
    options.data.userRequests.connect.id
  ) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: options.data.userRequests.connect.id },
      select: { groupRequests: true }
    })
    if (user.groupRequests.find((group) => group.id === options.where.id)) {
      throw new Error('User already requested to join group')
    }
  } else if (
    options.where.id &&
    options.data.userRequests &&
    options.data.userRequests.disconnect &&
    options.data.userRequests.disconnect.id
  ) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: options.data.userRequests.disconnect.id },
      select: { groupRequests: true }
    })
    if (!user.groupRequests.find((group) => group.id === options.where.id)) {
      throw new Error('User did not request to join group')
    }
  }
  return await groupUpdate(options)
})

export default prisma

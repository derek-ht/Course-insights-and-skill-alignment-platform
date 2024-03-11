import { Response, Request, NextFunction } from 'express'
import HTTPError from 'http-errors'
import {
  createPassword,
  isValidPasswordConditions,
  isValidEmailFormat,
  isValidPhoneNumber,
  addCourseToUser,
  saveImage,
  sendEmail,
  removeCourseFromUser
} from '../libs/utils.ts'
import { unlink, writeFile } from 'fs'
import { PdfReader } from 'pdfreader'
import prisma from '../libs/prisma.ts'
import { UserType } from '@prisma/client'
import { filter } from 'async'
import { PythonShell } from 'python-shell'
import { updateGroupSkills } from './group.ts'
import { userSummaryString } from './summary.ts'

/**
 * GET /user
 * Returns specified user
 * 
 * @param uId - User id
 * @returns User
 */
function userProfile(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.user
    .findUniqueOrThrow({
      where: { id: uId as string },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        school: true,
        degree: true,
        avatar: true,
        courses: true,
        ownedProjects: true,
        workExperience: true,
        groups: {
          select: {
            id: true,
            name: true,
            coverPhoto: true,
            description: true,
            size: true,
            project: {
              select: {
                id: true,
                title: true,
                description: true
              }
            }
          }
        },
        type: true,
        public: true
      }
    })
    .then((user) => {
      let userObj: any = user
      if (user.type === UserType.STUDENT) {
        userObj.ownedProjects = user.groups.map((x) => x.project).filter((x) => x !== null)
      }
      res.json(userObj)
    })
}

/**
 * PUT /user/setname
 * Sets user first and last name
 * 
 * @param uId - User Id
 * @param firstName - User firstname
 * @param lastName - User lastname
 * @throws {HTTPError} - If any Params are missing, If user not found
 */
async function userSetName(req: Request, res: Response, next: NextFunction) {
  const { uId, firstName, lastName } = req.body
  if (firstName === undefined || lastName === undefined) {
    next(HTTPError(400, 'Missing first name or last name'))
  }

  await prisma.user
    .update({
      where: { id: uId },
      data: { firstName: firstName, lastName: lastName }
    })
    .then(() => res.json({ message: 'Name updated' }))
    .catch(() => next(HTTPError(400, 'User not found')))
}

/**
 * PUT /user/setemail
 * Sets user email
 * 
 * @param uId - User Id
 * @param email - User email
 * @throws {HTTPError} - If any Params are missing, If user not found, If email already exists
 */
async function userSetEmail(req: Request, res: Response, next: NextFunction) {
  const { uId, email } = req.body
  if (email === undefined) {
    next(HTTPError(400, 'Missing email'))
  } else if (!isValidEmailFormat(email)) {
    next(HTTPError(400, 'Email does not follow required format'))
  }
  const user = await prisma.user // for prisma-mock
    .findUnique({ where: { id: uId } })
  if (!user) {
    next(HTTPError(400, 'User not found'))
  } else {
    await prisma.user
      .update({
        where: { id: user.id },
        data: { email: email }
      })
      .then(() => res.json({ message: 'Email updated' }))
      .catch(() => next(HTTPError(400, 'User with that email already exists')))
  }
}

/**
 * PUT /user/setpassword
 * Sets user password
 * 
 * @param uId - User Id
 * @param email - User password
 * @throws {HTTPError} - If any Params are missing, If user not found, If password doesn't meet requirements
 */
function userSetPassword(req: Request, res: Response, next: NextFunction) {
  const { uId, password } = req.body
  if (password === undefined) {
    next(HTTPError(400, 'Missing password'))
  }
  if (!isValidPasswordConditions(password)) {
    const msg =
      'Password does not satisfy conditions. ' +
      'Ensure password has minimum six characters, ' +
      'at least one uppercase letter, ' +
      'one lowercase letter, one number and one special character'
    next(HTTPError(400, msg))
  }
  var { salt, hash } = createPassword(password)
  prisma.user
    .update({
      where: { id: uId as string },
      data: { pwHash: hash, pwSalt: salt }
    })
    .then(() => res.json({ message: 'Password updated' }))
    .catch(() => next(HTTPError(400, 'User not found')))
}

/**
 * DELETE /user
 * Deletes specified user
 *
 * @param uId - User id
 * @throws {HTTPError} - If any Params are missing, If user is not found
 */
function userDelete(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.user
    .delete({
      where: { id: uId as string }
    })
    .then(() => res.json({ message: 'User deleted' }))
    .catch(() => next(HTTPError(400, 'Unable to delete user')))
}

/**
 * GET /users/all
 * Returns all users
 * 
 * @returns Users
 */
function userProfiles(req: Request, res: Response, next: NextFunction) {
  prisma.user
    .findMany({
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
        ownedProjects: true,
        workExperience: true,
        groups: true,
        type: true,
        public: true
      }
    })
    .then((profiles) => {
      res.json({ users: profiles })
    })
}

/**
 * GET /users/all/public
 * Returns only the public details of all users
 * 
 * @returns Users
 */
function userProfilesPublic(req: Request, res: Response, next: NextFunction) {
  prisma.user
    .findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        courses: true,
        school: true,
        degree: true
      }
    })
    .then((profiles) => {
      res.json({ users: profiles })
    })
}

/**
 * GET /users/shared
 * Returns all users which have been shared to the specified user
 * 
 * @param uId - User id
 * @returns Users
 */
function userProfilesShared(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.sharedProfile
    .findMany({
      where: { sharedWithId: uId as string },
      select: {
        profileOwner: {
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
            ownedProjects: true,
            workExperience: true,
            groups: true,
            type: true
          }
        }
      }
    })
    .then((profiles) => {
      res.json({ users: profiles.map((x) => x.profileOwner) })
    })
}

/**
 * GET /users/all/visible
 * Returns all users which are public and/or shared to the specified user
 * 
 * @param uId - User id
 * @returns Users
 */
function userProfilesVisible(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.user
    .findMany({
      where: {
        OR: [
          { public: true },
          { sharedWithUsers: { some: { sharedWithId: uId as string } } }
        ]
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
        ownedProjects: true,
        workExperience: true,
        groups: true,
        type: true
      }
    })
    .then((profiles) => {
      res.json({ users: profiles })
    })
}

/**
 * GET /users/ispublic
 * Returns whether the specified user is public
 * 
 * @param uId - User id
 * @returns Bool
 */
function userIsPublic(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.user
    .findUniqueOrThrow({
      where: { id: uId as string },
      select: { public: true }
    })
    .then((user) => {
      res.json({ isPublic: user.public })
    })
}

/**
 * PUT /user/togglevisibility
 * Changes the user visibility
 * 
 * @param uId - User id
 */
async function userToggleVisibility(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId } = req.body
  const isPublic = (
    await prisma.user.findUniqueOrThrow({
      where: { id: uId as string },
      select: { public: true }
    })
  ).public
  await prisma.user
    .update({
      where: { id: uId as string },
      data: { public: !isPublic }
    })
    .then((user) => {
      res.json({ message: 'User visibility updated', isPublic: user.public })
    })
}

/**
 * POST /user/addcourse
 * Adds course to user
 * 
 * @param uId - User id
 * @param code - Course code
 * @param year - Course year
 * 
 * @throws {HTTPError} - If the course is not found
 */
async function userAddCourse(req: Request, res: Response, next: NextFunction) {
  const { uId, code, year } = req.body
  await prisma.course
    .findUnique({
      where: { code_year: { code: code, year: year } }
    })
    .then((course) => {
      if (!course) {
        return next(
          HTTPError(400, `Course ${code} offered in ${year} not found`)
        )
      }
      addCourseToUser(uId, code, year)
        .then(async () => {
          await updateUserSkills(uId, res, `Course ${code} added`)
            .catch((err) => next(HTTPError(400, err)))
        })
        .catch((err) => {
          return next(HTTPError(err))
        })
    })
}

/**
 * POST /user/addcourse/multiple
 * Adds courses to user
 * 
 * @param uId - User id
 * @param courses - A list of course codes and course years
 * 
 * @throws {HTTPError} - If any course is not found
 */
async function userAddCourseMultiple(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, courses } = req.body
  let coursesAdded = ''

  for (let i = 0; i < courses.length; i++) {
    const { code, year } = courses[i]
    const result = await prisma.course
      .findUnique({
        where: { code_year: { code: code, year: year } }
      })
      .catch((err) => {
        return next(HTTPError(400, err))
      })
    if (!result) {
      return next(HTTPError(400, `Course ${code} offered in ${year} not found`))
    }
  }
  for (let i = 0; i < courses.length; i++) {
    const { code, year } = courses[i]
    await addCourseToUser(uId, code, year).catch((err) => {
      return next(HTTPError(400, err))
    })
    coursesAdded += `${code} `
  }
  await updateUserSkills(uId, res, `Courses added: ${coursesAdded.trim()}`)
    .catch((err) => next(HTTPError(400, err)))
}

/**
 * POST /user/removecourse
 * Removes courses from user
 * 
 * @param uId - User id
 * @param code - Course code
 * @param year - Course year
 * 
 * @throws {HTTPError} - If the course is not found
 */
function userRemoveCourse(req: Request, res: Response, next: NextFunction) {
  const { uId, code, year } = req.body
  prisma.user
    .findUniqueOrThrow({
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
    .then((user) => {
      let isAdded = false
      user.courses.forEach((course) => {
        if (course.code === code && course.year === year) {
          isAdded = true
        }
      })
      if (!isAdded) {
        return next(HTTPError(400, `User has not added course ${code}`))
      }
      prisma.course
        .update({
          where: { code_year: { code: code, year: year } },
          data: { users: { disconnect: { id: uId } } }
        })
        .then(async () => {
          await updateUserSkills(uId, res, `Course ${code} removed`)
            .catch((err) => next(HTTPError(400, err)))
        })
        .catch((err) => {
          return next(HTTPError(400, err))
        })
    })
    .catch(() => {
      return next(HTTPError(400, `Course ${code} offered in ${year} not found`))
    })
}

/**
 * POST /user/uploadtranscript
 * Adds courses from transcript to user
 * 
 * @param uId - User id
 * @param file - A base64 encoded string converted from PDF
 * 
 * @throws {HTTPError} - If any course is not found, 
 * If the provided string does not encode a valid UNSW statement
 */
async function userUploadTranscript(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, file } = req.body
  prisma.user
    .findUniqueOrThrow({
      where: { id: uId },
      select: {
        courses: true
      }
    })
    .then((user) => {
      user.courses.forEach(async (course) => {
        await removeCourseFromUser(uId, course.code)
      })
    })
    .catch((err) => {
      return next(HTTPError(400, err))
    })

  const filename = file.slice(0, 10)
  writeFile(`src/files/${filename}.pdf`, file, 'base64', () => {
    let content = ''
    new PdfReader(null).parseFileItems(
      `src/files/${filename}.pdf`,
      async (err, item) => {
        if (err) {
          return next(HTTPError(400, err))
        }
        if (item && item.text) {
          content += item!.text + ' '
        } else if (!item) {
          unlink(`src/files/${filename}.pdf`, async () => {
            const text = content.replace(/\s+/g, ' ')
            const match = text.match(/Term 1 [0-9]{4}/g)
            const years = text.split(/Term 1 [0-9]{4}/)
            years.shift()
            for (let i = 0; i < years.length; i++) {
              const period = years[i]
              const year = match![i].replace('Term 1 ', '')
              const matches = period.match(
                /[A-Z]{4} [0-9]{4}(.*?)(HD|CR|DN|FL|PS|SY)/g
              )
              if (!matches) {
                continue
              }
              for (let j = 0; j < matches.length; j++) {
                const course = matches![j]
                const grade = course.match(/(HD|CR|DN|FL|PS|SY)/)![0]
                if (grade !== 'FL' && grade !== 'PS') {
                  const courseCode = course
                    .match(/[A-Z]{4} [0-9]{4}/)![0]
                    .replace(' ', '')
                  await addCourseToUser(uId, courseCode, year).catch((err) => {
                    return next(HTTPError(err))
                  })
                }
              }
            }
            await updateUserSkills(uId, res, 'Courses updated')
              .catch((err) => next(HTTPError(400, err)))
          })
        }
      }
    )
  })
}

/**
 * PUT /user/setphone
 * Sets user phone number
 * 
 * @param uId - User Id
 * @param phoneNumber - User phone number
 * @throws {HTTPError} - If any Params are missing, If phone number is invalid
 */
async function userSetPhone(req: Request, res: Response, next: NextFunction) {
  const { uId, phoneNumber } = req.body
  if (phoneNumber === undefined) {
    return next(HTTPError(400, 'Missing phone number'))
  }
  if (!isValidPhoneNumber(phoneNumber) && phoneNumber !== '') {
    return next(HTTPError(400, 'Invalid phone number'))
  }
  await prisma.user
    .update({
      where: { id: uId },
      data: { phoneNumber: phoneNumber }
    })
    .then(() => res.json({ message: 'Phone number updated' }))
}

/**
 * PUT /user/setschool
 * Sets user school
 * 
 * @param uId - User Id
 * @param school - User school
 * @throws {HTTPError} - If any Params are missing
 */
async function userSetSchool(req: Request, res: Response, next: NextFunction) {
  const { uId, school } = req.body
  if (school === undefined) {
    return next(HTTPError(400, 'Missing school'))
  }

  await prisma.user
    .update({
      where: { id: uId },
      data: { school: school }
    })
    .then(() => res.json({ message: 'School updated' }))
}

/**
 * PUT /user/setdegree
 * Sets user degree
 * 
 * @param uId - User Id
 * @param degree - User degree
 * @throws {HTTPError} - If any Params are missing
 */
async function userSetDegree(req: Request, res: Response, next: NextFunction) {
  const { uId, degree } = req.body
  if (degree === undefined) {
    return next(HTTPError(400, 'Missing degree'))
  }

  await prisma.user
    .update({
      where: { id: uId },
      data: { degree: degree }
    })
    .then(() => res.json({ message: 'Degree updated' }))
}

/**
 * PUT /user/setavatar
 * Sets user avatar
 * 
 * @param uId - User Id
 * @param avatar - User avatar
 * @throws {HTTPError} - If any Params are missing, If image is not found
 */
async function userSetAvatar(req: Request, res: Response, next: NextFunction) {
  const { uId, imageUrl, topLeftX, topLeftY, width, height } = req.body
  if (
    imageUrl === undefined ||
    topLeftX === undefined ||
    topLeftY === undefined ||
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
  await prisma.user
    .update({
      where: { id: uId },
      data: { avatar: filePath! }
    })
    .then(() => res.json({ imagePath: filePath! }))
}

/**
 * PUT /user/settype
 * Sets user type
 * 
 * @param uId - User Id
 * @param type - User type
 * @throws {HTTPError} - If any Params are missing, If type is invalid
 */
async function userSetType(req: Request, res: Response, next: NextFunction) {
  const { uId, type } = req.body
  if (type === undefined) {
    return next(HTTPError(400, 'Missing type'))
  }
  if (
    type !== UserType.ADMIN &&
    type !== UserType.ACADEMIC_ADMIN &&
    type !== UserType.ACADEMIC &&
    type !== UserType.STUDENT
  ) {
    return next(HTTPError(400, 'Invalid type'))
  }
  await prisma.user
    .update({
      where: { id: uId },
      data: { type: type }
    })
    .then(() => res.json({ message: 'Type updated' }))
}

/**
 * PUT /user/addworkexperience
 * Adds user work experience
 * 
 * @param uId - User Id
 * @param workExperience - User work experience
 * @throws {HTTPError} - If any Params are missing, If work experience already exists
 */
async function userAddWorkExperience(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, workExperience } = req.body
  if (!workExperience) {
    return next(HTTPError(400, 'Missing work experience'))
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: uId } })
  if (user.workExperience.includes(workExperience)) {
    return next(HTTPError(400, 'Work experience already exists'))
  }
  user.workExperience.push(workExperience)
  await prisma.user.update({
    where: { id: uId },
    data: { workExperience: user!.workExperience }
  })
  await updateUserSkills(uId, res, 'Work experience updated')
    .catch((err) => next(HTTPError(400, err)))
}

/**
 * DELETE /user/workexperience
 * Removes user work experience
 * 
 * @param uId - User Id
 * @param workExperience - User work experience
 * @throws {HTTPError} - If any Params are missing, If work experience not found
 */
async function userDeleteWorkExperience(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, workExperience } = req.query
  if (workExperience === undefined) {
    return next(HTTPError(400, 'Missing work experience'))
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: uId as string }
  })

  if (!user.workExperience.includes(workExperience as string)) {
    return next(HTTPError(400, 'Work experience not found'))
  }
  user.workExperience = user.workExperience.filter(
    (exp) => exp !== workExperience
  )
  await prisma.user.update({
    where: { id: uId as string },
    data: { workExperience: user!.workExperience }
  })
  await updateUserSkills(uId as string, res, 'Work experience updated')
    .catch((err) => next(HTTPError(400, err)))
}

/**
 * PUT /user/workexperience
 * Edits user work experience
 * 
 * @param uId - User Id
 * @param oldworkExperience - User old work experience
 * @param newworkExperience - User new work experience
 * @throws {HTTPError} - If any Params are missing, If work experience not found
 */
async function userEditWorkExperience(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, oldWorkExperience, newWorkExperience } = req.body
  if (!oldWorkExperience || !newWorkExperience) {
    return next(HTTPError(400, 'Missing work experience'))
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: uId } })
  if (!user.workExperience.includes(oldWorkExperience)) {
    return next(HTTPError(400, 'Work experience not found'))
  }
  user.workExperience = user!.workExperience.map((exp) =>
    exp === oldWorkExperience ? newWorkExperience : exp
  )
  await prisma.user.update({
    where: { id: uId },
    data: { workExperience: user!.workExperience }
  })
  await updateUserSkills(uId as string, res, 'Work experience updated')
    .catch((err) => next(HTTPError(400, err)))
}

/**
 * PUT /user/shareprofile
 * User shares profile with other user
 * 
 * @param uId - User id
 * @param shareToId - Id of user being shared to
 * @throws {HTTPError} - If the user has already shared profile to other user
 */
async function userShareProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, shareToId } = req.body
  const shareToUser = await prisma.user.findUnique({ where: { id: shareToId } })
  if (!shareToUser) {
    return next(HTTPError(400, 'User not found'))
  }

  await prisma.sharedProfile
    .create({
      data: {
        profileOwner: { connect: { id: uId } },
        sharedWith: { connect: { id: shareToId } }
      },
      select: { profileOwner: true, sharedWith: true }
    })
    .then(({ profileOwner, sharedWith }) => {
      sendEmail(
        sharedWith.email,
        `{${profileOwner.firstName} ${profileOwner.lastName}} shared their profile with you`,
        `<p>You have been granted access to ${profileOwner.firstName} ${profileOwner.lastName}'s profile<br><br>
          Click <a href="http://localhost:3001/profile/${profileOwner.id}">here</a> to view their profile.</p>`
      )
      res.json({ message: 'Shared profile' })
    })
    .catch(() => {
      next(HTTPError(400, 'Profile already shared to this user'))
    })
}

/**
 * PUT /user/unshareprofile
 * User unshares profile with other user
 * 
 * @param uId - User id
 * @param unshareToId - Id of user being unshared to
 * @throws {HTTPError} - If the user hasn't shared profile to other user
 */
async function userUnshareProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, unshareToId } = req.body
  prisma.sharedProfile
    .delete({
      where: {
        profileOwnerId_sharedWithId: {
          profileOwnerId: uId,
          sharedWithId: unshareToId
        }
      }
    })
    .then(() => {
      res.json({ message: 'Unshared profile' })
    })
    .catch(() => {
      next(HTTPError(400, 'Profile not shared to this user'))
    })
}

/**
 * PUT /user/shareprofile/multi
 * User shares profile with multiple users
 * 
 * @param uId - User id
 * @param emails - Emails of users which are being shared to
 */
async function userUnshareAll(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.body
  prisma.sharedProfile
    .deleteMany({
      where: { profileOwnerId: uId }
    })
    .then(() => {
      res.json({ message: 'Unshared profile from all users' })
    })
}

/**
 * PUT /user/setdetails
 * Sets user phone, school and degree
 * 
 * @param uId - User Id
 * @param phoneNumber - User phone number
 * @param school - User school
 * @param degree - User degree
 * 
 * @throws {HTTPError} - If any Params are missing
 */
async function userSetPhoneSchoolDegree(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, phoneNumber, school, degree } = req.body
  if (uId === undefined || phoneNumber === undefined || school === undefined || degree === undefined) {
    return next(HTTPError(400, 'Missing fields'))
  }
  prisma.user
    .update({
      where: { id: uId },
      data: { phoneNumber: phoneNumber, school: school, degree: degree }
    })
    .then(() => res.json({ message: 'User updated' }))
}

/**
 * GET /user/isshared
 * Returns whether the user has shared their profile with another user
 * 
 * @param uId - User id
 * @param sharedWithId - The other user id
 * @returns Bool
 */
function userIsShared(req: Request, res: Response, next: NextFunction) {
  const { uId, sharedWithId } = req.query
  prisma.sharedProfile
    .findUnique({
      where: {
        profileOwnerId_sharedWithId: {
          profileOwnerId: uId as string,
          sharedWithId: sharedWithId as string
        }
      }
    })
    .then((shared) => {
      if (!shared) {
        res.json({ isShared: false })
      } else {
        res.json({ isShared: true })
      }
    })
}

/**
 * GET /users/sharedto
 * Returns the users which the user has shared their profile too
 * 
 * @param uId - User id
 * @returns Users
 */
function userProfilesSharedTo(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.sharedProfile
    .findMany({
      where: { profileOwnerId: uId as string },
      select: {
        sharedWith: true
      }
    })
    .then((profiles) => {
      res.json({
        users: profiles.map((x) => {
          return { id: x.sharedWith.id, email: x.sharedWith.email }
        })
      })
    })
}

/**
 * GET /user/project/skillgap
 * Returns the users which the user has shared their profile too
 * 
 * @param uId - User id
 * @returns Users
 */
async function userProjectSkillGap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, pId } = req.query
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

  const user = await prisma.user
    .findUniqueOrThrow({
      where: {
        id: uId as string
      },
      select: {
        workExperience: true,
        courses: true
      }
    })
    .catch((err) => {
      return next(HTTPError(400, err))
    })

  let userString = ''
  userString += `${user!.workExperience}___`
  user!.courses.forEach((course) => {
    userString += `${course.title} ${course.summary}___`
  })

  let pyshell = new PythonShell('src/python/skillgap.py')
  pyshell.send(userString.replaceAll('\n', ''))
  pyshell.send(projectRequirements.replaceAll('\n', ''))
  pyshell.on('message', async (message) => {
    res.json({ requirements: JSON.parse(message.toString().replaceAll("'", '"')) })
  })
  pyshell.end((err) => { if (err) console.log(err) });

}

/**
 * POST /user/invite/accept
 * User accepts an invitation to join a group
 * 
 * @param uId - User id
 * @param gId - Group id
 * @throws {HTTPError} - If User not invited to group, If Group is full, If Group not found
 */
function userAcceptInvite(req: Request, res: Response, next: NextFunction) {
  const { gId, uId } = req.body

  prisma.group
    .findUniqueOrThrow({
      where: { id: gId as string },
      select: {
        members: true,
        size: true,
        invitedUsers: true
      }
    })
    .then(async (group) => {
      if (!group.invitedUsers.find((user) => user.id === uId)) {
        return next(HTTPError(400, 'User not invited to group'))
      }
      if (group.members.length >= group.size) {
        return next(HTTPError(400, 'Group is full'))
      }
      if (group.size === group.members.length + 1) {
        await prisma.group.update({
          where: { id: gId },
          data: { userRequests: { set: [] } }
        })
      }
      prisma.group
        .update({
          where: { id: gId as string },
          data: {
            invitedUsers: { disconnect: { id: uId as string } },
            userRequests: { disconnect: { id: uId as string } },
            members: { connect: { id: uId as string } }
          }
        })
        .then(() => res.json({ message: 'Invite accepted' }))
    })
    .catch(() => next(HTTPError(400, 'Group not found')))
}

/**
 * POST /user/invite/reject
 * User rejects an invitation to join a group
 * 
 * @param uId - User id
 * @param gId - Group id
 * @throws {HTTPError} - If User not invited to group, If Group not found
 */
function userRejectInvite(req: Request, res: Response, next: NextFunction) {
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
        .then(() => res.json({ message: 'Invite rejected' }))
    })
    .catch(() => next(HTTPError(400, 'Group not found')))
}

/**
 * GET /user/invites/
 * Gets all group invites of a user
 * 
 * @param uId - User id
 * @returns - Groups
 */
function userGetInvites(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.user
    .findUniqueOrThrow({
      where: { id: uId as string },
      select: {
        groupInvites: {
          select: {
            id: true,
            name: true,
            coverPhoto: true,
            description: true,
            size: true,
            projectId: true
          }
        }
      }
    })
    .then((user) => {
      res.json({ invites: user.groupInvites })
    })
}

/**
 * POST /user/request
 * User requests to join a group
 * 
 * @param uId - User id
 * @param gId - Group id
 * @throws {HTTPError} - If Group not found, If Group is full, 
 * If User has already requested to join this group
 */
async function userRequestJoin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { gId, uId } = req.body
  const user = await prisma.user.findUnique({
    where: { id: uId },
    select: { groups: true, groupInvites: true }
  })
  const group = await prisma.group.findUnique({
    where: { id: gId },
    select: { members: true, size: true }
  })
  if (!group) {
    return next(HTTPError(400, 'Group not found'))
  }
  if (user!.groups.find((group) => group.id === gId)) {
    return next(HTTPError(400, 'User already in group'))
  }
  if (group.size <= group.members.length) {
    return next(HTTPError(400, 'Group is full'))
  }
  if (user!.groupInvites.find((group) => group.id === gId)) {
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
        data: { userRequests: { set: [] } }
      })
    }
    res.json({ message: 'User joined group' })
  } else {
    await prisma.group
      .update({
        where: { id: gId },
        data: {
          userRequests: { connect: { id: uId } }
        }
      })
      .then(() => res.json({ message: 'User requested to join group' }))
      .catch(() => next(HTTPError(400, 'User already requested to join group')))
  }
}

/**
 * DELETE /user/unrequest
 * User deletes requests to join a group
 * 
 * @param uId - User id
 * @param gId - Group id
 * @throws {HTTPError} - If Group not found, If User has not requested to join this group
 */
async function userCancelRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { gId, uId } = req.query
  const user = await prisma.user.findUnique({
    where: { id: uId as string },
    select: { groupRequests: true }
  })
  if (!user!.groupRequests.find((group) => group.id === gId)) {
    return next(HTTPError(400, 'User has not requested to join group'))
  }
  await prisma.group
    .update({
      where: { id: gId as string },
      data: {
        userRequests: { disconnect: { id: uId as string } }
      }
    })
    .then(() => res.json({ message: 'User cancelled request to join group' }))
    .catch((err) => next(HTTPError(400, err.message)))
}

/**
 * GET /user/requests
 * Gets the 
 * 
 * @param uId - User id
 * @returns - groupRequests
 */
function userGetRequests(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.user
    .findUniqueOrThrow({
      where: { id: uId as string },
      select: {
        groupRequests: {
          select: {
            id: true,
            name: true,
            coverPhoto: true,
            description: true,
            size: true,
            projectId: true
          }
        }
      }
    })
    .then((user) => {
      res.json({ requests: user.groupRequests })
    })
}

/**
 * PUT /user/shareprofile/multi
 * User shares profile with multiple users
 * 
 * @param uId - User id
 * @param emails - Emails of users which are being shared to
 */
function userShareProfileMulti(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uId, emails } = req.body
  filter(
    emails,
    async (email: string) =>
      await prisma.user.findUnique({ where: { email: email } })
  ).then(async (filtered_emails) => {
    for (let email of filtered_emails) {
      await prisma.sharedProfile
        .create({
          data: {
            profileOwner: { connect: { id: uId } },
            sharedWith: { connect: { email: email } }
          },
          select: { profileOwner: true, sharedWith: true }
        })
        .then(({ profileOwner, sharedWith }) => {
          sendEmail(
            sharedWith.email,
            `{${profileOwner.firstName} ${profileOwner.lastName}} shared their profile with you`,
            `<p>You have been granted access to ${profileOwner.firstName} ${profileOwner.lastName}'s profile<br><br>
          Click <a href="http://localhost:3001/profile/${profileOwner.id}?fromEmail=true">here</a> to view their profile.</p>`
          )
        })
        .catch(() => { })
    }
  })
  res.json({ message: 'Shared profile to multiple users' })
}

/**
 * Updates skills of user and all groups the user is in
 * 
 * @param uId - User Id
 * @param message - Message for response
 */
async function updateUserSkills(uId: string, res: Response, message: string) {
  const { corpusCount, userSummary } = await userSummaryString(uId)
  if (userSummary) {
    const wordCloudWordCount = 50
    let topN = Math.round(wordCloudWordCount / corpusCount)
    if (topN < 1) topN = 1
    let pyshell = new PythonShell('src/python/keywords.py')
    pyshell.send(topN.toString().replaceAll('\n', ''))
    pyshell.send(userSummary.replaceAll('\n', ''))
    pyshell.on('message', async (message) => {
      await prisma.user.update({
        where: { id: uId },
        data: { skills: message.toString() }
      })
    })
    pyshell.end(() => { res.json({ message: message }) });
  } else {
    await prisma.user.update({
      where: { id: uId },
      data: { skills: '[]' }
    })
    res.json({ message: message })
  }
  await prisma.user
    .findUnique({
      where: {
        id: uId
      },
      select: {
        groups: true
      }
    })
    .then((user) => {
      user?.groups.forEach(async (group) => {
        updateGroupSkills(group.id)
      })
    })
}

export {
  userDelete,
  userSetPassword,
  userSetEmail,
  userSetName,
  userProfile,
  userProfiles,
  userProfilesPublic,
  userProfilesShared,
  userProfilesVisible,
  userIsPublic,
  userToggleVisibility,
  userAddCourse,
  userAddCourseMultiple,
  userRemoveCourse,
  userUploadTranscript,
  userSetPhone,
  userSetSchool,
  userSetDegree,
  userSetPhoneSchoolDegree,
  userSetAvatar,
  userSetType,
  userAddWorkExperience,
  userDeleteWorkExperience,
  userEditWorkExperience,
  userShareProfile,
  userUnshareProfile,
  userUnshareAll,
  userIsShared,
  userProfilesSharedTo,
  userProjectSkillGap,
  userAcceptInvite,
  userRejectInvite,
  userGetInvites,
  userRequestJoin,
  userCancelRequest,
  userGetRequests,
  userShareProfileMulti
}

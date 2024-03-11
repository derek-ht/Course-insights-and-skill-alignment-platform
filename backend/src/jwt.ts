import passport from 'passport'
import { DoneCallback } from 'passport'
import passportJWT, { VerifiedCallback, ExtractJwt } from 'passport-jwt'
import { VerifyCallbackWithRequest } from 'passport-jwt'
import { PrismaClient, UserType } from '@prisma/client'
import { Request, Response, NextFunction, query } from 'express'
import fs from 'fs'
import HTTPError from 'http-errors'
import 'dotenv/config'

import prisma from '../libs/prisma.ts'
const JWTStrategy = passportJWT.Strategy

const PUB_KEY = fs.readFileSync('./id_rsa_pub.pem', 'utf8')

const cookieExtractor = (req: Request) => {
  let jwt = null
  if (req && req.cookies) {
    jwt = req.cookies['jwt']
  }
  return jwt
}

const req_options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
  passReqToCallback: true
}

interface Payload {
  sub: string
  iat: Date
}

/**
 * JWT authentication strategy
 *
 * Verfies the token integrity and checks if the user exists in the database
 */
passport.use(
  'jwt',
  new JWTStrategy(
    req_options,
    (req: Request, payload: Payload, done: VerifiedCallback) => {
      prisma.user
        .findUnique({ where: { id: payload.sub } })
        .then((user) => {
          if (user) {
            req.body.authUserId = user.id
            req.body.authUserType = user.type
            return done(null, user)
          } else {
            return done(null, false)
          }
        })
        .catch((err) => done(err, false))
    }
  )
)

/**
 * authorizeRole
 *
 * Middleware to check if the user has the required role or roles
 */
const authorizeRole = (roles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (roles.includes(req.body.authUserType)) {
      return next()
    } else {
      return next(
        HTTPError(403, 'Forbidden: User does not have authorized role')
      )
    }
  }
}

/**
 * authorizeUIdIsAuthUser
 *
 * Middleware to check if the user id matches the authorized user id
 */
async function authorizeUIdIsAuthUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uId = req.body.uId || req.query.uId
  if (!uId) {
    return next(HTTPError(400, 'Missing user id'))
  }
  const user = await prisma.user.findUnique({ where: { id: uId } })
  if (!user) {
    return next(HTTPError(400, 'User not found'))
  }
  if (
    req.body.authUserId === uId ||
    req.body.authUserType === UserType.ADMIN ||
    req.body.authUserType === UserType.ACADEMIC_ADMIN
  ) {
    return next()
  } else {
    return next(
      HTTPError(403, 'Forbidden: User id does not match authorized user')
    )
  }
}

/**
 * authorizeAcademicUIdIsAuthUser
 *
 * Middleware to check if the user id matches the authorized user id and is an academic
 */
function authorizeAcademicUIdIsAuthUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uId = req.body.uId || req.query.uId
  if (!uId) {
    return next(HTTPError(400, 'Missing user id'))
  }
  const user = prisma.user.findUnique({ where: { id: uId } })
  if (!user) {
    return next(HTTPError(400, 'User not found'))
  }
  if (
    (req.body.authUserId === uId &&
      req.body.authUserType === UserType.ACADEMIC) ||
    req.body.authUserType === UserType.ACADEMIC_ADMIN
  ) {
    return next()
  } else {
    return next(
      HTTPError(
        403,
        'Forbidden: User id does not match authorized user or user is not an academic'
      )
    )
  }
}

/**
 * authorizeCourseOwner
 *
 * Middleware to check if the user is the owner of the course
 */
function authorizeCourseOwner(req: Request, res: Response, next: NextFunction) {
  const code = req.body.code || req.query.code
  const year = req.body.year || req.query.year
  if (year === undefined || code === undefined) {
    return next(HTTPError(400, 'Missing course information'))
  }
  prisma.course
    .findUniqueOrThrow({
      where: { code_year: { code: code, year: year } }
    })
    .then((course) => {
      if (
        course.ownerId === req.body.authUserId ||
        req.body.authUserType === UserType.ACADEMIC_ADMIN
      ) {
        return next()
      } else {
        return next(HTTPError(403, 'Forbidden: User is not course owner'))
      }
    })
    .catch(() => {
      next(HTTPError(400, 'Course not found'))
    })
}

/**
 * authorizeProjectOwner
 *
 * Middleware to check if the user is the owner of the project
 */
function authorizeProjectOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const pId = req.body.pId || req.query.pId
  if (!pId) {
    return next(HTTPError(400, 'Missing pId'))
  }
  prisma.project
    .findUniqueOrThrow({ where: { id: pId } })
    .then((project) => {
      if (
        req.body.authUserType === UserType.ADMIN ||
        req.body.authUserType === UserType.ACADEMIC_ADMIN ||
        project.ownerId === req.body.authUserId
      ) {
        return next()
      } else {
        return next(HTTPError(403, 'Forbidden: User is not project owner'))
      }
    })
    .catch(() => {
      next(HTTPError(400, 'Project not found'))
    })
}

/**
 * authorizeGroupMember
 *
 * Middleware to check if the user is a member of the group
 */
function authorizeGroupMember(req: Request, res: Response, next: NextFunction) {
  const gId = req.body.gId || req.query.gId
  if (!gId) {
    return next(HTTPError(400, 'Missing gId'))
  }
  prisma.group
    .findUniqueOrThrow({
      where: { id: gId },
      select: { members: { select: { id: true } } }
    })
    .then((group) => {
      if (
        req.body.authUserType === UserType.ADMIN ||
        req.body.authUserType === UserType.ACADEMIC_ADMIN ||
        group.members.map((x) => x.id).includes(req.body.authUserId)
      ) {
        return next()
      } else {
        return next(HTTPError(403, 'Forbidden: User is not group member'))
      }
    })
    .catch(() => {
      next(HTTPError(400, 'Group not found'))
    })
}

/**
 * authorizeSharedProfile
 *
 * Middleware to check if the user has shared their profile with the authorized user
 */
function authorizeSharedProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uId = req.body.uId || req.query.uId
  if (!uId) {
    return next(HTTPError(400, 'Missing uId'))
  }
  prisma.user
    .findUniqueOrThrow({
      where: { id: uId },
      select: { id: true, sharedWithUsers: true, public: true }
    })
    .then((user) => {
      if (
        user.id === req.body.authUserId ||
        user.public ||
        req.body.authUserType === UserType.ADMIN ||
        req.body.authUserType === UserType.ACADEMIC_ADMIN ||
        user.sharedWithUsers
          .map((x) => x.sharedWithId)
          .includes(req.body.authUserId)
      ) {
        return next()
      } else {
        return next(HTTPError(403, 'Forbidden: User has not shared profile'))
      }
    })
    .catch(() => {
      next(HTTPError(400, 'User profile not found'))
    })
}

export {
  authorizeRole,
  authorizeUIdIsAuthUser,
  authorizeAcademicUIdIsAuthUser,
  authorizeCourseOwner,
  authorizeProjectOwner,
  authorizeGroupMember,
  authorizeSharedProfile
}

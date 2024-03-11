import { UserType } from '@prisma/client'
import HTTPError from 'http-errors'
import { Request, Response, NextFunction } from 'express'
import {
  isValidEmailFormat,
  isValidNameFormat,
  isValidPasswordConditions,
  isValidPassword,
  createJWT,
  createPassword,
  isStaffEmail,
  sendEmail,
  verifyJWT
} from '../libs/utils.ts'

import prisma from '../libs/prisma.ts'
import { JwtPayload } from 'jsonwebtoken'

/**
 * POST /auth/register/v2
 * Registers an unverified user.
 *
 * @param firstName - The first name of the registering user.
 * @param lastName - The last name of the registering user
 * @param email - The email of the registering user
 * @param password - The password of the registering user
 * @throws {HTTPError} - If the parameters don't meet the required specifications
 */
async function authRegisterV2(req: Request, res: Response, next: NextFunction) {
  const { firstName, lastName, email, password } = req.body
  if (!isValidNameFormat(firstName) || !isValidNameFormat(lastName)) {
    next(HTTPError(400, 'Name does not follow required format'))
  }

  if (!isValidEmailFormat(email)) {
    next(HTTPError(400, 'Email does not follow required format'))
  }

  if (!isValidPasswordConditions(password)) {
    next(
      HTTPError(
        400,
        'Password does not satisfy conditions. ' +
        'Ensure password has minimum six characters, ' +
        'at least one uppercase letter, ' +
        'one lowercase letter, one number and one special character'
      )
    )
  }

  var { salt, hash } = createPassword(password)
  const user = await prisma.user.findUnique({
    where: { email: email }
  })
  if (user) {
    next(HTTPError(400, 'User with this email has already been registered'))
  }

  prisma.unverifiedUser
    .create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        pwHash: hash,
        pwSalt: salt,
        type: isStaffEmail(email) ? UserType.ACADEMIC : UserType.STUDENT
      }
    })
    .then((user) => {
      const token = createJWT(user!)
      sendEmail(
        email,
        `Verify your email address`,
        `<p>To secure your CISAP account, we need to verify your email address:<br><br>
          Click <a href="http://localhost:3001/?token=${token}">here</a> to verify your email.</p>`
      )
      res.json({ message: 'Check your email to verify your account' })
    })
    .catch(() => {
      next(
        HTTPError(
          400,
          'User with this email has already been registered but is not yet verified, please check your email for a verification link'
        )
      )
    })
}

/**
 * POST /auth/register/verify/:token
 * Verifies a user.
 *
 * @param firstName - The first name of the registering user.
 * @param lastName - The last name of the registering user
 * @param email - The email of the registering user
 * @param password - The password of the registering user
 * @throws {HTTPError} - If the parameters don't meet the required specifications
 */
async function authRegisterVerify(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { token } = req.params
  try {
    const { sub, type, iat } = verifyJWT(token) as JwtPayload
    const unverifiedUser = await prisma.unverifiedUser.findUniqueOrThrow({
      where: { id: sub }
    })
    const user = await prisma.user.create({
      data: {
        firstName: unverifiedUser.firstName,
        lastName: unverifiedUser.lastName,
        email: unverifiedUser.email,
        pwHash: unverifiedUser.pwHash,
        pwSalt: unverifiedUser.pwSalt,
        type: unverifiedUser.type
      }
    })
    await prisma.unverifiedUser.delete({ where: { id: unverifiedUser.id } })
    res
      .cookie('jwt', createJWT(user), {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      })
      .json({ uId: user.id })
  } catch (err) {
    next(HTTPError(401, 'Invalid token'))
  }
}

/**
 * POST /auth/login
 * Logs in a user.
 *
 * @param email - User email
 * @param password - User password
 * @throws {HTTPError} - If password is incorrect, If email not found
 */
function authLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  prisma.user
    .findUniqueOrThrow({ where: { email: email } })
    .then((user) => {
      if (!isValidPassword(password, user!.pwHash, user!.pwSalt)) {
        next(HTTPError(400, 'Incorrect password'))
      } else {
        res
          .cookie('jwt', createJWT(user!), {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
          })
          .json({ uId: user!.id })
      }
    })
    .catch(() => next(HTTPError(400, 'User not found')))
}

/**
 * POST /auth/logout
 * Logs out a user.
 *
 * @throws {HTTPError} - If token is invalid
 */
function authLogout(req: Request, res: Response) {
  if (req.cookies['jwt']) {
    res.clearCookie('jwt').json({ message: 'You have been logged out' })
  } else {
    throw HTTPError(401, 'Invalid token')
  }
}

/**
 * POST /auth/passwordreset/request
 * Requests to change a user's password.
 *
 * @param email - User email
 */
function authPasswordResetRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body
  prisma.user.findUnique({ where: { email: email } }).then((user) => {
    if (user) {
      const token = createJWT(user!)
      sendEmail(
        email,
        `Reset your CISAP password`,
        `<p>Click <a href="http://localhost:3000/auth/password/reset/${token}">here</a> to reset your password.</p>`
      )
    }
    res.json({ message: 'Check your email to reset your password' })
  })
}

/**
 * POST /auth/passwordreset/:token
 * Resets the password of user
 *
 * @param token - User token
 * @param password - New user password 
 * @throws {HTTPError} - If User not found, If User is unauthorized
 */
function authPasswordReset(req: Request, res: Response, next: NextFunction) {
  const { token } = req.params
  const { password } = req.body
  if (!isValidPasswordConditions(password)) {
    next(
      HTTPError(
        400,
        'Password does not satisfy conditions. ' +
        'Ensure password has minimum six characters, ' +
        'at least one uppercase letter, ' +
        'one lowercase letter, one number and one special character'
      )
    )
  }
  try {
    const { sub, type, iat } = verifyJWT(token) as JwtPayload
    const { hash, salt } = createPassword(password)
    prisma.user
      .update({
        where: { id: sub },
        data: {
          pwHash: hash,
          pwSalt: salt
        }
      })
      .then(() => {
        res.json({ message: 'Password reset successfully' })
      })
      .catch(() => next(HTTPError(400, 'User not found')))
  } catch (err) {
    next(HTTPError(401, 'Unauthorized'))
  }
}

export {
  authRegisterV2,
  authRegisterVerify,
  authLogin,
  authLogout,
  authPasswordResetRequest,
  authPasswordReset
}

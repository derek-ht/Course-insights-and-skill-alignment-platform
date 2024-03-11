import crypto from 'crypto'
import { User, UnverifiedUser, UserType } from '@prisma/client'
import jsonwebtoken from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import 'dotenv/config'
import puppeteer from 'puppeteer'
import { compile } from 'html-to-text'
import HTTPError from 'http-errors'
import nodemailer from 'nodemailer'
import prisma from './prisma.ts'
import fetch from 'node-fetch'
import jimp from 'jimp'
import imageType from 'image-type'
import { v4 } from 'uuid'
import { readFileSync } from 'fs'
const config = JSON.parse(readFileSync('src/config.json', 'utf-8'))

const port = config.port
const url = config.url

const PUB_KEY = readFileSync('./id_rsa_pub.pem', 'utf8')

// Object to represent a user that is not visible
const PRIVATE_USER = {
  id: '__ANONYMOUS__',
  firstName: 'Anonymous',
  lastName: '',
  avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
  skills: '[]'
}

function isValidEmailFormat(email: string) {
  const exp = /^([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})$/
  return email.match(exp) === null ? false : true
}

function isValidNameFormat(name: string) {
  const exp = /^[a-z ,.'-]+$/i
  return name.match(exp) === null ? false : true
}

/**
 * isValidPasswordConditions
 *
 * @param password
 * @returns boolean
 * Checks if the password meets the following conditions:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 *
 */
function isValidPasswordConditions(password: string) {
  const exp =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&'])[A-Za-z\d@$!%*?&]{8,}$/
  return password.match(exp) === null ? false : true
}

/**
 * isValidPassword
 *
 * Checks if the password of a user matches the users salt and hash
 *
 * @param password
 * @param hash
 * @param salt
 * @returns boolean
 */
function isValidPassword(password: string, hash: string, salt: string) {
  var new_hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex')

  return hash === new_hash
}

function isValidPhoneNumber(phoneNumber: string) {
  const exp = /^\d{10}$/
  return phoneNumber.match(exp) === null ? false : true
}

/**
 * createPassword
 *
 * Encrypts the password with a salt to be stored in the database
 *
 * @param password
 * @returns { salt: string, hash: string}
 */
function createPassword(password: string) {
  var salt = crypto.randomBytes(32).toString('hex')
  var hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex')
  return { salt: salt, hash: hash }
}

/**
 * createJWT
 *
 * Creates a JWT token for a user by signing the payload with the private key
 * The token contains the date/time the token was issue at, the user ID and type as a playload
 *
 * @param user
 * @returns
 */
function createJWT(user: User | UnverifiedUser) {
  const payload = {
    sub: user.id,
    type: user.type,
    iat: Date.now()
  }
  return jsonwebtoken.sign(payload, process.env.PRIVATE_KEY!, {
    expiresIn: '1d',
    algorithm: 'RS256'
  })
}

/**
 * verifyJWT
 *
 * Verifies the JWT token by checking the signature with the public key
 *
 * @param token
 * @returns
 */
function verifyJWT(token: string) {
  return jsonwebtoken.verify(token, PUB_KEY, {
    algorithms: ['RS256']
  })
}

function isStaffEmail(email: String) {
  const exp = /@staff.unsw.edu.au$/
  return email.match(exp) === null ? false : true
}

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || err.status || 500
  console.log(status === 500 ? err : 'error: ' + err.message)
  res.status(status).json({
    error: err.message
  })
  return next()
}

/**
 * getHandbookSummary
 *
 * Uses puppeteer to scrape the UNSW handbook for the course summary
 *
 * @param url
 * @returns
 */
async function getHandbookSummary(url: string) {
  const browser = await puppeteer.launch({ headless: 'new' }).catch((err) => {
    throw HTTPError(400, err)
  })

  const page = await browser.newPage().catch((err) => {
    throw HTTPError(400, err)
  })

  await page
    .goto(url, {
      waitUntil: 'domcontentloaded'
    })
    .catch((err) => {
      throw HTTPError(400, err)
    })

  const content = await page.content().catch((err) => {
    throw HTTPError(400, err)
  })

  await browser.close().catch((err) => {
    throw HTTPError(400, err)
  })

  const exp_title = /<title>Handbook.+<\/title>/g
  const title_match = content.match(exp_title)
  let title = title_match ? title_match[0] : ''

  let exp_description =
    /<\/div><div aria-hidden="true">.+<div class="css-ehhfa4-Box-Flex-ToggleContainer e1tb03p80">/
  let description_match = content.match(exp_description)

  if (!description_match) {
    exp_description =
      /<div aria-hidden="false">.+<div data-testid="attributes-table" elevation="3" class="css-1kvn5ef-Box-Card-EmptyCard-css-AttributesTable-css ehflpff0">/
    description_match = content.match(exp_description)
  }

  let description = description_match ? description_match[0] : ''

  const compiled_convert = compile()
  title = compiled_convert(title).trim().replace('Handbook - ', '')
  description = compiled_convert(description).trim()
  return { title: title, summary: description }
}

async function removeCourseFromUser(uId: string, courseCode: string) {
  const courses = await prisma.course
    .findMany({
      where: { code: courseCode }
    })
    .catch((err) => {
      throw HTTPError(err)
    })
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i]
    if (course !== null) {
      await prisma.course
        .update({
          where: { id: course.id },
          data: { users: { disconnect: { id: uId } } }
        })
        .catch((err) => {
          throw HTTPError(err)
        })
    }
  }
}

async function addCourseToUser(uId: string, courseCode: string, year: string) {
  await removeCourseFromUser(uId, courseCode).catch((err) => {
    throw HTTPError(err)
  })
  await prisma.course
    .findUnique({
      where: { code_year: { code: courseCode, year: year } }
    })
    .catch((err) => {
      throw HTTPError(400, err)
    })
    .then(async (course) => {
      if (course !== null) {
        await prisma.course
          .update({
            where: { id: course!.id, year: course!.year },
            data: {
              users: { connect: { id: uId } }
            }
          })
          .catch((err) => {
            throw HTTPError(400, err)
          })
      }
    })
}

async function saveImage(
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  // Validate image URL
  const response = await fetch(imageUrl).catch(() => {
    throw HTTPError(400, 'Invalid image url')
  })
  const imageBuffer = Buffer.from(await response!.arrayBuffer())
  const imageMimeType = await imageType(imageBuffer)
  if (
    !imageMimeType ||
    (!imageMimeType.mime.includes('jpeg') &&
      !imageMimeType.mime.includes('png'))
  ) {
    throw HTTPError(400, 'Invalid image type')
  }

  // Fetch and load the image using Jimp
  const image = await jimp.read(imageBuffer)

  // Get the image dimensions
  const imageWidth = image.getWidth()
  const imageHeight = image.getHeight()

  // Check if the cropping dimensions are valid
  if (
    x + width > imageWidth ||
    y + height > imageHeight ||
    width <= 0 ||
    height <= 0 ||
    x < 0 ||
    y < 0
  ) {
    throw HTTPError(400, 'Invalid cropping dimensions')
  }

  // Crop the image
  image.crop(x, y, width, height)

  // Determine the content type based on the file extension
  const contentType =
    imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') ? 'jpg' : 'png'

  // Generate a unique filename for the cropped image
  const fileName = `${v4()}.${contentType}`

  // Save the cropped image to the static folder
  await image.writeAsync('static/' + fileName)

  return `${url}:${port}/imgurl/${fileName}`
}

function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com.au',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const mailOptions = {
    to: to,
    from: process.env.EMAIL_USER,
    subject: subject,
    html: html
  }

  transporter.sendMail(mailOptions, (err, info) => {
    console.log(err)
    console.log(info)
  })
}

/**
 * isVisibleTo
 *
 * Checks if a user is visible to another user, i.e. is the user public or shared with the viewer
 *
 * @param viewerId
 * @param uId
 * @returns
 */
async function isVisibleTo(viewerId: string, uId: string) {
  const viewer = await prisma.user.findUnique({ where: { id: viewerId } })
  const user = await prisma.user.findUnique({
    where: { id: uId },
    select: { sharedWithUsers: true, public: true }
  })
  if (!viewer || !user) {
    throw HTTPError(400, 'User not found')
  }
  if (
    viewer.type === UserType.ADMIN ||
    viewer.type === UserType.ACADEMIC_ADMIN
  ) {
    return true
  }
  const shared =
    user.sharedWithUsers.find((x) => x.sharedWithId === viewerId) === undefined
  return shared || user.public
}

export {
  isValidEmailFormat,
  isValidNameFormat,
  isValidPassword,
  isValidPasswordConditions,
  isValidPhoneNumber,
  createJWT,
  createPassword,
  isStaffEmail,
  errorHandler,
  getHandbookSummary,
  removeCourseFromUser,
  addCourseToUser,
  saveImage,
  sendEmail,
  verifyJWT,
  isVisibleTo,
  PRIVATE_USER
}

import HTTPError from 'http-errors'
import fetch from 'node-fetch'
import jimp from 'jimp'
import imageType from 'image-type'
import { v4 } from 'uuid'
import {
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
  addCourseToUser,
  isVisibleTo
} from '../utils.ts'
import { readFileSync } from 'fs'
const config = JSON.parse(readFileSync('src/config.json', 'utf-8'))

const port = config.port
const url = config.url

/**
 * Mocked saveImage
 *
 * Identical to original except does not save image in static folder
 *
 * @param imageUrl
 * @param x
 * @param y
 * @param width
 * @param height
 * @returns
 */
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
  //   await image.writeAsync('static/' + fileName)

  return `${url}:${port}/imgurl/${fileName}`
}

function sendEmail(to: string, subject: string, html: string) { }

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
  addCourseToUser,
  saveImage,
  sendEmail,
  isVisibleTo
}

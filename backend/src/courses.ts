import HTTPError from 'http-errors'
import prisma from '../libs/prisma.ts'
import { Request, Response, NextFunction } from 'express'
import { getHandbookSummary } from '../libs/utils.ts'
import { unlink, writeFile } from 'fs'
import { PdfReader } from 'pdfreader'

/**
 * POST /academic/addcourse/web
 * Adds course to the database through url.
 *
 * @param url - The url of course handbook entry.
 * @param uId - The id of the academic user adding the course.
 * @throws {HTTPError} - If the url is not a valid UNSW handbook url
 */
async function academicAddCourseWeb(req: Request, res: Response, next: NextFunction) {
  const { url, uId } = req.body
  let matches = url.match(/[A-Z]{4}[0-9]{4}/)
  const courseCode = matches != null ? matches[0] : ''
  matches = url.match(/\/courses\/[0-9]{4}\//)
  const year = matches != null ? matches[0].replace(/[courses|\/]/g, '') : ''
  if (!courseCode || !year) {
    return next(HTTPError(400, 'Not a UNSW Handbook url'))
  }
  try {
    const { title, summary } = await getHandbookSummary(url)
    await prisma.course
      .create({
        data: {
          code: courseCode,
          title: title,
          summary: summary,
          owner: { connect: { id: uId } },
          year: year
        }
      }).then(() => res.json({ message: `Course ${courseCode} offered in ${year} has been added` }))
      .catch(async () => {
        await prisma.course.update({
          where: {
            code_year: {
              code: courseCode,
              year: year
            }
          },
          data: {
            title: title,
            summary: summary,
          }
        }).then(() => res.json({ message: `Course ${courseCode} offered in ${year} has been updated` }))
      })
  } catch (_) {
    return next(HTTPError(400, 'Invalid url'))
  }
}

/**
 * POST /academic/addcourse/PDF
 * Adds course to the database through PDF.
 *
 * @param file - The encoded base64 string of the PDF file.
 * @param uId - The id of the academic user adding the course.
 * @throws {HTTPError} - If file is not a base64 encoded string of a UNSW course outline
 */
async function academicAddCoursePDF(req: Request, res: Response, next: NextFunction) {
  const { file, uId } = req.body
  const filename = file.slice(0, 10)
  writeFile(`src/files/${filename}.pdf`, file, 'base64', () => {
    let content = ''
    new PdfReader(null).parseFileItems(
      `src/files/${filename}.pdf`,
      async (err, item) => {
        if (err) {
          return
        }
        if (item && item.text) {
          content += item.text + ' '
        } else if (!item) {
          let text = content.replace(/\s+/g, ' ')
            .replace(
              /[A-Z]{4}[0-9]{4} [A-Za-z ]* - 20[0-9]{2} Printed: [0-9]{1,2}\/[0-9]{1,2}\/20[0-9]{2} \| [0-9]+ of [0-9]+ /gm,
              ''
            ).replace(/UNSW Course Outline [A-Z]{4}[0-9]{4} /, '')
          let matches = text.match(/[A-Z]{4}[0-9]{4}/)
          const courseCode = matches != null ? matches[0] : ''
          matches = text.match(/Year : [0-9]{4}/)
          const year = matches != null ? matches[0].replace('Year : ', '') : ''
          if (!courseCode || !year || !text) {
            return next(HTTPError(400, 'Not a UNSW course outline'))
          }
          const course_title = text
            .match(/.* - [0-9]{4} Course Code/)![0]
            .replace(/ - [0-9]{4} Course Code/, '')
            .trim()
          const description = text
            .match(/Course Description (.*?) (Course Learning Outcomes|Relationship to Other Courses)/)![0]
            .trim()
            .replace('Course Description ', '')
            .replace('Course Learning Outcomes', '')
            .replace('Relationship to Other Courses', '')
          unlink(`src/files/${filename}.pdf`, async () => {
            await prisma.course
              .create({
                data: {
                  code: courseCode,
                  title: course_title,
                  summary: description,
                  owner: { connect: { id: uId } },
                  year: year
                }
              }).then(() => res.json({ message: `Course ${courseCode} offered in ${year} has been added` }))
              .catch(async () => {
                await prisma.course.update({
                  where: {
                    code_year: {
                      code: courseCode,
                      year: year
                    }
                  },
                  data: {
                    title: course_title,
                    summary: description,
                  }
                }).then(() => res.json({ message: `Course ${courseCode} offered in ${year} has been updated` }))
              })
          })
        }
      }
    )
  })
}

/**
 * GET /courses/owned
 * Returns owned courses.
 *
 * @param uId - The id of the academic user.
 * @returns courses - All courses which the user owns.
 */
function coursesGetOwned(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.course
    .findMany({
      where: { ownerId: uId as string },
      select: {
        id: true,
        code: true,
        year: true,
        title: true,
        summary: true
      }
    })
    .then((courses) => {
      res.json({ courses: courses })
    })
}

/**
 * GET /courses/all
 * Returns all courses.
 *
 * @returns courses - All courses in the entire database.
 */
function coursesGetAll(req: Request, res: Response, next: NextFunction) {
  prisma.course
    .findMany({
      select: {
        id: true,
        code: true,
        year: true,
        title: true,
        summary: true
      }
    })
    .then((courses) => {
      res.json({ courses: courses })
    })
}

/**
 * DELETE /course
 * Deletes an owned course.
 *
 * @param code - The code of course to be deleted.
 * @param year - The year of course to be deleted.
 */
function courseDelete(req: Request, res: Response, next: NextFunction) {
  const { code, year } = req.query
  prisma.course
    .delete({
      where: { code_year: { code: code as string, year: year as string } }
    })
    .then(() => res.json({ message: 'Course deleted' }))
}

/**
 * GET /course
 * Returns specified course.
 *
 * @param code - The code of course to be deleted.
 * @param year - The year of course to be deleted.
 * @returns course - The corresponding course.
 * @throws {HTTPError} - If the course does not exist
 */
function courseGet(req: Request, res: Response, next: NextFunction) {
  const { code, year } = req.query
  prisma.course
    .findUniqueOrThrow({
      where: { code_year: { code: code as string, year: year as string } },
      select: {
        id: true,
        code: true,
        year: true,
        title: true,
        summary: true
      }
    })
    .then((course) => {
      res.json({ course: course })
    })
    .catch(() => next(HTTPError(400, 'Course not found')))
}

/**
 * GET /courses/enrolled
 * Returns enrolled courses.
 *
 * @param uId - The id of the user.
 * @returns courses - All courses which the user has added.
 */
function coursesGetEnrolled(req: Request, res: Response, next: NextFunction) {
  const { uId } = req.query
  prisma.course
    .findMany({
      where: { users: { some: { id: uId as string } } },
      select: { code: true, id: true, summary: true, title: true, year: true }
    })
    .then((courses) => {
      res.json({ courses: courses })
    })
}
export {
  academicAddCourseWeb,
  academicAddCoursePDF,
  courseGet,
  coursesGetOwned,
  coursesGetAll,
  courseDelete,
  coursesGetEnrolled
}

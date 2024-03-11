import prisma from '../libs/prisma.ts'
import { Response, Request, NextFunction } from 'express'
import HTTPError from 'http-errors'
import { PythonShell } from "python-shell"

/**
 * GET /course/summary/visual
 * Get keywords with score and source from course
 *
 * @param code - Course code
 * @param year - Course year
 */
async function courseSummaryVisual(req: Request, res: Response, next: NextFunction) {
    const { code, year } = req.query
    const course = await prisma.course.findUniqueOrThrow({
        where: {
            code_year: { code: code as string, year: year as string }
        },
        select: {
            code: true,
            title: true,
            summary: true
        }
    }).catch((err) => {
        return next(HTTPError(400, err))
    })

    if (!course) {
        return next(HTTPError(400, { error: 'No Course found' }))
    }
    const wordCloudWordCount = 10
    let pyshell = new PythonShell('src/python/keywords.py')
    pyshell.send(wordCloudWordCount.toString().replaceAll('\n', ''))
    pyshell.send(course!.code + course!.title + '. ' + course!.summary + '|'.replaceAll('\n', ''))
    pyshell.on('message', (message) => {
        res.json({ summary: JSON.parse(message.toString().replaceAll('\'', '"')) })
    })
    pyshell.end((err) => { if (err) console.log(err) });
}

/**
 * GET /user/summary/visual
 * Get keywords with score and source from user
 *
 * @param uId - User id
 */
async function userSummaryVisual(req: Request, res: Response, next: NextFunction) {
    const { uId } = req.query
    prisma.user.findUnique({
        where: {
            id: uId as string
        },
        select: {
            skills: true
        }
    }).then((user) => {
        if (!user) {
            return next(HTTPError(400, 'No User found'))
        }
        res.json({ summary: JSON.parse(user.skills.replaceAll('\'', '"')) })
    })
}

async function userSummaryString(uId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: uId
        },
        select: {
            workExperience: true,
            courses: true
        }
    })

    if (!user) {
        throw HTTPError(400, 'User not found')
    }

    let userSummary = ''
    if (user!.workExperience) {
        user!.workExperience.forEach((experience) => {
            userSummary += experience + '|'
        })
    }

    if (user!.courses) {
        user!.courses.forEach((course) => {
            userSummary += course.code + ' ' + course.title + '. ' + course.summary + '|'
        })
    }
    return { corpusCount: (user!.workExperience ? user!.workExperience.length : 0) + (user!.courses ? user!.courses.length : 0), userSummary: userSummary }
}

async function groupSummaryString(gId: string) {
    const group = await prisma.group.findUnique({
        where: {
            id: gId
        },
        select: {
            members: {
                select: {
                    id: true,
                    workExperience: true,
                    courses: true
                }
            }
        }
    })

    let totalCorpusCount = 0
    let groupSummary = ''
    for (let i = 0; i < group!.members.length; i++) {
        const { corpusCount, userSummary } = await userSummaryString(group!.members[i].id)
        totalCorpusCount += corpusCount
        groupSummary += userSummary
    }
    return { corpusCount: totalCorpusCount, groupSummary: groupSummary }
}

export { courseSummaryVisual, userSummaryVisual, userSummaryString, groupSummaryString }
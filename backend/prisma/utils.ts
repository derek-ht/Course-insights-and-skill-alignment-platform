import { UserType } from '@prisma/client'
import prisma from '../libs/prisma.ts'
import { createPassword, getHandbookSummary } from '../libs/utils.ts'

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
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

function getUId(email: string) {
    return prisma.user.findUnique({
        where: {
            email: email
        }
    }).then((user) => user!.id)
}

async function createCourse(
    uId: string, code: string, year: string) {
    const { title, summary } = await getHandbookSummary(`https://www.handbook.unsw.edu.au/undergraduate/courses/${year}/${code}`)
    if (title && summary) {
        prisma.course.create({
            data: {
                code: code,
                title: title,
                summary: summary,
                owner: { connect: { id: uId } },
                year: year
            }
        })
    }
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

export { register, getUId, createCourse, createProject, getRandomInt }
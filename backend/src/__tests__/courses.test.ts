import {
  afterAll,
  beforeEach,
  test,
  describe,
  expect,
  vi
} from 'vitest'
import { UserType } from '@prisma/client'
import request from 'supertest'
import { app } from '../index.js'
import { readFileSync } from 'fs'
import {
  login,
  register,
  createCourse,
  getCoursesFromUser
} from './test-utils.ts'
import prisma from '../../libs/__mocks__/prisma.ts'

vi.mock('../../libs/prisma.ts')

let academicAdminId: string,
  academicId: string,
  studentId: string,
  student2Id: string,
  invalidId: string

beforeEach(async () => {
  await prisma.user.deleteMany()
  await prisma.course.deleteMany()
  academicAdminId = await register(
    'chadam',
    'chen',
    'chadam.chen@staff.unsw.edu.au',
    'Password123?',
    UserType.ACADEMIC_ADMIN
  )
  academicId = await register(
    'adam',
    'chen',
    'adam.chen@staff.unsw.edu.au',
    'Password123?',
    UserType.ACADEMIC
  )
  studentId = await register(
    'adam',
    'chen',
    'adam.chen@student.unsw.edu.au',
    'Password123?',
    UserType.STUDENT
  )
  student2Id = await register(
    'ethan',
    'fong',
    'ethan.fong@student.unsw.edu.au',
    'Password123?',
    UserType.STUDENT
  )
  invalidId = academicAdminId + academicId + student2Id + studentId + 'invalid'
})

afterAll(async () => {
  await prisma.user.deleteMany()
  await prisma.course.deleteMany()
})

describe('POST /academic/addcourse/web', () => {
  test('Academic user is able to add course', async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2023/COMP3331?year=2023'
      })
      .expect(200, {
        message: 'Course COMP3331 offered in 2023 has been added'
      })
  }, 10000)
  test('Non-academic user is able to add course', async () => {
    var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2023/COMP3331?year=2023'
      })
      .expect(403, { error: 'Forbidden: User does not have authorized role' })
  })
  test('Uploading using invalid url', async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'www.handbook.unsw.edu.au/undergraduate/courses/2023/COMP3331?year=2023'
      })
      .expect(400, { error: 'Invalid url' })
  })
  test('Uploading using non UNSW handbook url', async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.google.com.au/'
      })
      .expect(400, { error: 'Not a UNSW Handbook url' })
  })
  test('Updates course and year which already exists', async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2023/COMP3331?year=2023'
      })
      .expect(200, {
        message: 'Course COMP3331 offered in 2023 has been added'
      })
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2023/COMP3331?year=2023'
      })
      .expect(200, { message: 'Course COMP3331 offered in 2023 has been updated' })
  }, 10000)
})

const base64MATH2501 = readFileSync('src/__tests__/files/MATH2501outline.pdf', {
  encoding: 'base64'
})

const base64COMP2521 = readFileSync('src/__tests__/files/COMP2521outline.pdf', {
  encoding: 'base64'
})

describe('POST /academic/addcourse/PDF', () => {
  test('Academic user is able to add course', async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/pdf')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        file: base64MATH2501
      })
      .expect(200, {
        message: 'Course MATH2501 offered in 2023 has been added'
      })
  })
  test('Updates course and year which already exists', async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/pdf')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        file: base64MATH2501
      })
      .expect(200, {
        message: 'Course MATH2501 offered in 2023 has been added'
      })
    await request(app)
      .post('/academic/addcourse/pdf')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        file: base64MATH2501
      })
      .expect(200, {
        message: 'Course MATH2501 offered in 2023 has been updated'
      })
  })
  test('Non academic user is unable to add course', async () => {
    var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/pdf')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        file: base64MATH2501
      })
      .expect(403, { error: 'Forbidden: User does not have authorized role' })
  })
})

describe('POST /user/addcourse', async () => {
  beforeEach(async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2023/COMP1511?year=2023'
      })
      .expect(200)
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2022/COMP2521?year=2022'
      })
      .expect(200)
    await request(app)
      .post('/academic/addcourse/pdf')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        file: base64COMP2521
      })
      .expect(200)
  })
  test('Users are able to add existing courses', async () => {
    var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/user/addcourse')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        uId: studentId,
        code: 'COMP1511',
        year: '2023'
      })
      .expect(200, { message: 'Course COMP1511 added' })
    await request(app)
      .post('/user/addcourse')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        uId: studentId,
        code: 'COMP2521',
        year: '2022'
      })
      .expect(200, { message: 'Course COMP2521 added' })
    expect(await getCoursesFromUser(studentId)).toEqual([
      { code: 'COMP1511', year: '2023' },
      { code: 'COMP2521', year: '2022' }
    ])
  }, 10000)
  test('Users are unable to add non-existent courses', async () => {
    var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/user/addcourse')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        uId: studentId,
        code: 'COMP1521',
        year: '2023'
      })
      .expect(400, { error: 'Course COMP1521 offered in 2023 not found' })
    await request(app)
      .post('/user/addcourse')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        uId: studentId,
        code: 'COMP2521',
        year: '2020'
      })
      .expect(400, { error: 'Course COMP2521 offered in 2020 not found' })
    expect(await getCoursesFromUser(studentId)).toEqual([])
  })
})

describe('POST /user/addcourse/multiple', async () => {
  beforeEach(async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2023/COMP1511?year=2023'
      })
      .expect(200)
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2022/COMP2521?year=2022'
      })
      .expect(200)
    await request(app)
      .post('/academic/addcourse/pdf')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        file: base64COMP2521
      })
      .expect(200)
  })
  test('Users are able to add existing courses', async () => {
    var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/user/addcourse/multiple')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        uId: studentId,
        courses: [
          {
            code: 'COMP1511',
            year: '2023'
          },
          {
            code: 'COMP2521',
            year: '2022'
          }
        ]
      })
      .expect(200, { message: 'Courses added: COMP1511 COMP2521' })
    expect(await getCoursesFromUser(studentId)).toEqual([
      { code: 'COMP1511', year: '2023' },
      { code: 'COMP2521', year: '2022' }
    ])
  })
  test('Users are unable to add non-existent courses', async () => {
    var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/user/addcourse/multiple')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        uId: studentId,
        courses: [
          {
            code: 'COMP1511',
            year: '2023'
          },
          {
            code: 'COMP1521',
            year: '2023'
          },
          {
            code: 'COMP2521',
            year: '2022'
          }
        ]
      })
      .expect(400, { error: 'Course COMP1521 offered in 2023 not found' })
    expect(await getCoursesFromUser(studentId)).toEqual([])
  })
})

describe('POST /user/removecourse', async () => {
  beforeEach(async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2023/COMP1511?year=2023'
      })
      .expect(200)
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2022/COMP2521?year=2022'
      })
      .expect(200)
    await request(app)
      .post('/academic/addcourse/pdf')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        file: base64COMP2521
      })
      .expect(200)
  })
  describe('success', () => {
    test('Users are able to remove existing courses', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          code: 'COMP1511',
          year: '2023'
        })
        .expect(200, { message: 'Course COMP1511 added' })
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          code: 'COMP2521',
          year: '2022'
        })
        .expect(200, { message: 'Course COMP2521 added' })
      expect(await getCoursesFromUser(studentId)).toEqual([
        { code: 'COMP1511', year: '2023' },
        { code: 'COMP2521', year: '2022' }
      ])
      await request(app)
        .post('/user/removecourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          code: 'COMP2521',
          year: '2022'
        })
        .expect(200, { message: 'Course COMP2521 removed' })
    }, 10000)
  })
  describe('error', () => {
    test('Users are unable to remove courses they have not added', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .post('/user/removecourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          code: 'COMP2521',
          year: '2022'
        })
        .expect(400, { error: 'User has not added course COMP2521' })
    })
  })
})

describe('POST /user/uploadtranscript', async () => {
  beforeEach(async () => {
    var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2021/COMP1511?year=2021'
      })
      .expect(200)
    await request(app)
      .post('/academic/addcourse/web')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        url: 'https://www.handbook.unsw.edu.au/undergraduate/courses/2022/COMP2521?year=2022'
      })
      .expect(200)
    await request(app)
      .post('/academic/addcourse/pdf')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        file: base64COMP2521
      })
      .expect(200)
  })
  test('User successfully uploads transcript', async () => {
    const base64transcript = readFileSync('src/__tests__/files/statement.pdf', {
      encoding: 'base64'
    })
    var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
    await request(app)
      .post('/user/uploadtranscript')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({
        uId: studentId,
        file: base64transcript
      })
      .expect(200, { message: 'Courses updated' })
    await sleep(1000)
    function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms)
      })
    }
    expect(await getCoursesFromUser(studentId)).toEqual([
      { code: 'COMP1511', year: '2021' },
      { code: 'COMP2521', year: '2022' }
    ])
  })
})

describe('GET /courses/owned', () => {
  let comp1511Id: string, comp1521Id: string, comp2521Id: string
  beforeEach(async () => {
    comp1511Id = await createCourse('COMP1511', '2021', academicId)
    comp1521Id = await createCourse('COMP1521', '2021', academicId)
    comp2521Id = await createCourse('COMP2521', '2022', academicAdminId)
  })
  describe('success', () => {
    test('Academic user is able to get owned courses', async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/owned')
        .query({ uId: academicId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          courses: [
            {
              id: comp1511Id,
              code: 'COMP1511',
              year: '2021',
              title: 'title',
              summary: 'summary'
            },
            {
              id: comp1521Id,
              code: 'COMP1521',
              year: '2021',
              title: 'title',
              summary: 'summary'
            }
          ]
        })
    })
    test('Academic admin is able to get owned courses of another user', async () => {
      var res = await login('chadam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/owned')
        .query({ uId: academicId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          courses: [
            {
              id: comp1511Id,
              code: 'COMP1511',
              year: '2021',
              title: 'title',
              summary: 'summary'
            },
            {
              id: comp1521Id,
              code: 'COMP1521',
              year: '2021',
              title: 'title',
              summary: 'summary'
            }
          ]
        })
    })
  })
  describe('error', () => {
    test('Academic user is unable to get owned courses of another user', async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/owned')
        .query({ uId: academicAdminId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error:
            'Forbidden: User id does not match authorized user or user is not an academic'
        })
    })
    test('Non academic user is unable to get their owned courses', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/owned')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error:
            'Forbidden: User id does not match authorized user or user is not an academic'
        })
    })
    test("Non academic user is unable to get another's owned courses", async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/owned')
        .query({ uId: academicId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error:
            'Forbidden: User id does not match authorized user or user is not an academic'
        })
    })
  })
})

describe('GET /courses/all', () => {
  let comp1511Id: string, comp1521Id: string, comp2521Id: string
  beforeEach(async () => {
    comp1511Id = await createCourse('COMP1511', '2021', academicId)
    comp1521Id = await createCourse('COMP1521', '2021', academicId)
    comp2521Id = await createCourse('COMP2521', '2022', academicAdminId)
  })
  describe('success', () => {
    test('Academic user is able to get all courses', async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/all')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          courses: [
            {
              id: comp1511Id,
              code: 'COMP1511',
              year: '2021',
              title: 'title',
              summary: 'summary'
            },
            {
              id: comp1521Id,
              code: 'COMP1521',
              year: '2021',
              title: 'title',
              summary: 'summary'
            },
            {
              id: comp2521Id,
              code: 'COMP2521',
              year: '2022',
              title: 'title',
              summary: 'summary'
            }
          ]
        })
    })
    test('Student user is able to get all courses', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/all')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          courses: [
            {
              id: comp1511Id,
              code: 'COMP1511',
              year: '2021',
              title: 'title',
              summary: 'summary'
            },
            {
              id: comp1521Id,
              code: 'COMP1521',
              year: '2021',
              title: 'title',
              summary: 'summary'
            },
            {
              id: comp2521Id,
              code: 'COMP2521',
              year: '2022',
              title: 'title',
              summary: 'summary'
            }
          ]
        })
    })
  })
})

describe('GET /course', () => {
  let comp1511Id: string, comp1521Id: string, comp2521Id: string
  beforeEach(async () => {
    comp1511Id = await createCourse('COMP1511', '2021', academicId)
    comp1521Id = await createCourse('COMP1521', '2021', academicId)
    comp2521Id = await createCourse('COMP2521', '2022', academicAdminId)
  })
  describe('success', () => {
    test('Student user is able to get course', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/course')
        .query({ code: 'COMP1511', year: '2021' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          course: {
            id: comp1511Id,
            code: 'COMP1511',
            year: '2021',
            title: 'title',
            summary: 'summary'
          }
        })
    })
    test('Academic user is able to get course', async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/course')
        .query({ code: 'COMP1511', year: '2021' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          course: {
            id: comp1511Id,
            code: 'COMP1511',
            year: '2021',
            title: 'title',
            summary: 'summary'
          }
        })
    })
  })
  describe('error', () => {
    test('Course does not exist', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/course')
        .query({ code: 'COMP1511', year: '2022' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'Course not found' })
    })
  })
})

describe('DELETE /course', () => {
  let comp1511Id: string, comp1521Id: string, comp2521Id: string
  beforeEach(async () => {
    comp1511Id = await createCourse('COMP1511', '2021', academicId)
    comp1521Id = await createCourse('COMP1521', '2021', academicId)
    comp2521Id = await createCourse('COMP2521', '2022', academicAdminId)
  })
  describe('success', () => {
    test('Academic user is able to delete course', async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .delete('/course')
        .query({ code: 'COMP1511', year: '2021' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'Course deleted' })
      await request(app)
        .get('/course')
        .query({ code: 'COMP1511', year: '2021' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'Course not found' })
    })
    test('Academic admin is able to delete course', async () => {
      var res = await login('chadam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .delete('/course')
        .query({ code: 'COMP1511', year: '2021' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'Course deleted' })
      await request(app)
        .get('/course')
        .query({ code: 'COMP1511', year: '2021' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'Course not found' })
    })
  })
  describe('error', () => {
    test("Academic user is unable to delete another users's course", async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .delete('/course')
        .query({ code: 'COMP2521', year: '2022' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error: 'Forbidden: User is not course owner'
        })
    })
    test("Student user is unable to delete another users's course", async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .delete('/course')
        .query({ code: 'COMP1511', year: '2021' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error: 'Forbidden: User is not course owner'
        })
    })
    test('Academic user is unable to delete course that does not exist', async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .delete('/course')
        .query({ code: 'COMP2521', year: '2023' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'Course not found' })
    })
    test('Missing code', async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .delete('/course')
        .query({ year: '2023' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'Missing course information' })
    })
    test('Missing year', async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .delete('/course')
        .query({ code: 'COMP2521' })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'Missing course information' })
    })
  })
})

describe('GET /courses/enrolled', () => {
  let comp1511Id: string, comp1521Id: string, comp2521Id: string
  beforeEach(async () => {
    comp1511Id = await createCourse('COMP1511', '2021', academicId)
    comp1521Id = await createCourse('COMP1521', '2021', academicId)
    comp2521Id = await createCourse('COMP2521', '2022', academicAdminId)
  })
  describe('success', () => {
    test('Student gets courses they are enrolled in', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, code: 'COMP1521', year: '2021' })
        .expect(200)
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, code: 'COMP2521', year: '2022' })
        .expect(200)
      await request(app)
        .get('/courses/enrolled')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          courses: [
            {
              id: comp1521Id,
              code: 'COMP1521',
              year: '2021',
              title: 'title',
              summary: 'summary'
            },
            {
              id: comp2521Id,
              code: 'COMP2521',
              year: '2022',
              title: 'title',
              summary: 'summary'
            }
          ]
        })
    })
    test('Admin gets courses a student is enrolled in', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, code: 'COMP1521', year: '2021' })
        .expect(200)
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, code: 'COMP2521', year: '2022' })
        .expect(200)
      var res = await login('chadam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/enrolled')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          courses: [
            {
              id: comp1521Id,
              code: 'COMP1521',
              year: '2021',
              title: 'title',
              summary: 'summary'
            },
            {
              id: comp2521Id,
              code: 'COMP2521',
              year: '2022',
              title: 'title',
              summary: 'summary'
            }
          ]
        })
    })
  })
  describe('error', () => {
    test('Student cannot get enrolled courses of another student', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, code: 'COMP1521', year: '2021' })
        .expect(200)
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, code: 'COMP2521', year: '2022' })
        .expect(200)
      var res = await login('ethan.fong@student.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/enrolled')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Invalid uId', async () => {
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, code: 'COMP1521', year: '2021' })
        .expect(200)
      await request(app)
        .post('/user/addcourse')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, code: 'COMP2521', year: '2022' })
        .expect(200)
      var res = await login('adam.chen@student.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/courses/enrolled')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: invalidId })
        .expect(400, {
          error: 'User not found'
        })
    })
  })
})
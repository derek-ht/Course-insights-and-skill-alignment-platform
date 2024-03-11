import {
  afterAll,
  beforeEach,
  test,
  describe,
  expect,
  vi
} from 'vitest'
import request from 'supertest'
import { app } from '../index.js'
import { UserType } from '@prisma/client'
import {
  login,
  register,
} from './test-utils.ts'
import prisma from '../../libs/__mocks__/prisma.ts'

vi.mock('../../libs/prisma.ts')
vi.mock('../../libs/utils.ts')

let studentId: string,
  student2Id: string,
  adminId: string,
  invalidId: string,
  academicId: string

beforeEach(async () => {
  await prisma.user.deleteMany()
  await prisma.sharedProfile.deleteMany()
  await prisma.course.deleteMany()
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
    'adam@student.com',
    'Password123?',
    UserType.STUDENT
  )
  invalidId = studentId + student2Id + adminId + 'invalid'
})

afterAll(async () => {
  await prisma.user.deleteMany()
  await prisma.sharedProfile.deleteMany()
  await prisma.course.deleteMany()
})

describe('GET /user/summary/visual', () => {
  describe('success', () => {
    test('Able to get summary of user', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/summary/visual')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({
          uId: studentId
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('summary')
          expect(typeof res.body.summary).toBe('object')
        })
    }, 20000)
  })
  describe('error', () => {
    test('User does not exist', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/summary/visual')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({
          uId: invalidId
        })
        .expect(400, { error: 'No User found' })
    })
  })
})

describe('GET /course/summary/visual', () => {
  describe('success', () => {
    test('Able to get summary of course', async () => {
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
        .get('/course/summary/visual')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({
          code: 'COMP3331',
          year: '2023'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('summary')
          expect(typeof res.body.summary).toBe('object')
        })
    }, 20000)
  })
  describe('error', () => {
    test('Course does not exist', async () => {
      var res = await login('adam.chen@staff.unsw.edu.au', 'Password123?')
      await request(app)
        .get('/course/summary/visual')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({
          code: 'COMP3311',
          year: '2023'
        })
        .expect(400, { error: 'No Course found' })
    })
  })
})
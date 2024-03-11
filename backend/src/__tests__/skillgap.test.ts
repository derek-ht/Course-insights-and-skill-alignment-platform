import { afterAll, beforeEach, test, describe, expect, vi } from 'vitest'
import { UserType } from '@prisma/client'
import request from 'supertest'
import { app } from '../index.js'
import {
  login,
  register,
  createGroup,
  createProject,
} from './test-utils.ts'
import prisma from '../../libs/__mocks__/prisma.ts'

let studentId: string,
  adminId: string,
  academicAdminId: string,
  invalidId: string

vi.mock('../../libs/prisma.ts')
vi.mock('../../libs/utils.ts')

beforeEach(async () => {
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  adminId = await register(
    'admin',
    'fong',
    'admin@staff.com',
    'Password123?',
    UserType.ADMIN
  )
  studentId = await register(
    'adam',
    'chen',
    'adam@student.com',
    'Password123?',
    UserType.STUDENT
  )
  academicAdminId = await register(
    'jon',
    'doe',
    'jon@staff.com',
    'Password123?',
    UserType.ACADEMIC_ADMIN
  )
  invalidId = studentId + adminId + academicAdminId + adminId + 'invalid'
})

afterAll(async () => {
  await prisma.project.deleteMany()
  await prisma.group.deleteMany()
  await prisma.user.deleteMany()
})

describe('GET /user/project/skillgap', () => {
  let projectRegularId: string
  beforeEach(async () => {
    const project1Fields = {
      title: 'Course Insight and Skills Alignment Platform',
      description: 'test description',
      scope: 'requirements and scope',
      topics: ['test topic'],
      requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
      outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
      maxGroupSize: '5',
      minGroupSize: '2',
      maxGroupCount: '1'
    }
    projectRegularId = await createProject(project1Fields, academicAdminId)
  })
  describe('success', () => {
    test('User is able to get skillgap', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/project/skillgap')
        .query({ uId: studentId, pId: projectRegularId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('requirements')
          expect(typeof res.body.requirements).toBe('object')
        })
    }, 10000)
  })
  describe('error', () => {
    test('Invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/project/skillgap')
        .query({ uId: invalidId, pId: projectRegularId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, {
          error: 'User not found'
        })
    })
    test('Invalid pId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/project/skillgap')
        .query({ uId: studentId, pId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'No Project found' })
    })
  })
})

describe('POST /group/project/skillgap', () => {
  let groupId: string
  let projectRegularId: string
  beforeEach(async () => {
    const project1Fields = {
      title: 'Course Insight and Skills Alignment Platform',
      description: 'test description',
      scope: 'requirements and scope',
      topics: ['test topic'],
      requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
      outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
      maxGroupSize: '5',
      minGroupSize: '2',
      maxGroupCount: '1'
    }
    projectRegularId = await createProject(
      project1Fields,
      academicAdminId
    )
    groupId = await createGroup('progchamps', studentId)
  })
  describe('success', () => {
    test('Member of group is able to get skillgap', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/project/skillgap')
        .query({ gId: groupId, pId: projectRegularId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('requirements')
          expect(typeof res.body.requirements).toBe('object')
        })
    })
  })
  describe('error', () => {
    test('Invalid gId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/project/skillgap')
        .query({ gId: invalidId, pId: projectRegularId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'Group not found' })
    })
    test('Invalid pId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/project/skillgap')
        .query({ gId: groupId, pId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'No Project found' })
    })
    test('User is not group member', async () => {
      await register(
        'adam',
        'chen',
        'adam@student2.com',
        'Password123?',
        UserType.STUDENT
      )
      let groupId = await createGroup('progchamps', studentId)
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .get('/group/project/skillgap')
        .query({ gId: groupId, pId: projectRegularId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, { error: 'Forbidden: User is not group member' })
    })
  })
})
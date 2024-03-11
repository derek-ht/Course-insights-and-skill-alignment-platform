import { afterAll, beforeEach, test, describe, expect, vi } from 'vitest'
import { UserType } from '@prisma/client'
import request from 'supertest'
import { app } from '../index.js'
import {
  login,
  register,
  createGroup,
  createProject,
  togglevisibility,
  createGroupWithFields
} from './test-utils.ts'
import prisma from '../../libs/__mocks__/prisma.ts'

let studentId: string,
  student2Id: string,
  adminId: string,
  academicAdminId: string,
  invalidId: string

vi.mock('../../libs/prisma.ts')
vi.mock('../../libs/utils.ts')

beforeEach(async () => {
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.group.deleteMany()
  await prisma.sharedProfile.deleteMany()
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
  student2Id = await register(
    'adam',
    'chen',
    'adam@student2.com',
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

describe('GET /user/recommendedusers', () => {
  describe('success', () => {
    test('Recommended users who have shared their profile', async () => {
      var res = await login('adam@student2.com', 'Password123?')
      await togglevisibility(student2Id)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedusers')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: []
        })
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, shareToId: studentId })
        .expect(200)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedusers')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: [
            {
              id: student2Id,
              firstName: 'adam',
              lastName: 'chen',
              email: 'adam@student2.com',
              phoneNumber: null,
              school: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              courses: [],
              degree: null,
              groups: [],
              workExperience: [],
              skills: []
            }
          ]
        })
    }, 10000)
    test('Recommended users who are public', async () => {
      var res = await login('adam@student.com', 'Password123?')
      togglevisibility(student2Id)
      await request(app)
        .get('/user/recommendedusers')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: []
        })
      togglevisibility(student2Id)
      await request(app)
        .get('/user/recommendedusers')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: [
            {
              id: student2Id,
              firstName: 'adam',
              lastName: 'chen',
              email: 'adam@student2.com',
              phoneNumber: null,
              school: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              courses: [],
              degree: null,
              groups: [],
              workExperience: [],
              skills: []
            }
          ]
        })
    }, 10000)
  })
  describe('error', () => {
    test('Invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedusers')
        .query({ uId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'User not found' })
    })
  })
})

describe('GET /group/recommendedprojects', () => {
  const project1Fields = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: '1',
    minGroupSize: '1',
    maxGroupCount: '1',
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  const project2Fields = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: '5',
    minGroupSize: '2',
    maxGroupCount: '1',
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  describe('success', () => {
    test('Recommended projects for their group', async () => {
      const project1Id = await createProject(project1Fields, academicAdminId)
      const groupId = await createGroupWithFields(studentId, {
        name: 'Progchamps',
        description: 'description',
        size: 1
      })
      var res = await login('adam@student.com', 'Password123?')
      let expectedProject1 = project1Fields
      expectedProject1.id = project1Id
      await request(app)
        .get('/group/recommendedprojects')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [expectedProject1] })
    }, 10000)
    test('Not recommended projects which their group has already joined', async () => {
      const project1Id = await createProject(project1Fields, academicAdminId)
      var res = await login('adam@student.com', 'Password123?')
      const groupId = await createGroupWithFields(studentId, {
        name: 'Progchamps',
        description: 'description',
        size: 1
      })
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, pId: project1Id })
        .expect(200, { message: 'Project joined by group' })
      await request(app)
        .get('/group/recommendedprojects')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [] })
    })
    test('Not recommended project when group size it too small', async () => {
      await createProject(project2Fields, academicAdminId)
      var res = await login('adam@student.com', 'Password123?')
      const groupId = await createGroupWithFields(studentId, {
        name: 'Progchamps',
        description: 'description',
        size: 1
      })
      await request(app)
        .get('/group/recommendedprojects')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [] })
    })
    test('Not recommended project when group size is too big', async () => {
      await createProject(project1Fields, academicAdminId)
      var res = await login('adam@student.com', 'Password123?')
      const groupId = await createGroupWithFields(studentId, {
        name: 'Progchamps',
        description: 'description',
        size: 10
      })
      await request(app)
        .get('/group/recommendedprojects')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [] })
    })
    test('Not recommended project when the project already has maximum number of groups', async () => {
      const project1Id = await createProject(project1Fields, academicAdminId)
      var res = await login('adam@student.com', 'Password123?')
      const groupId = await createGroupWithFields(studentId, {
        name: 'Progchamps',
        description: 'description',
        size: 1
      })
      let expectedProject1 = project1Fields
      expectedProject1.id = project1Id
      await request(app)
        .get('/group/recommendedprojects')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [expectedProject1] })
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, pId: project1Id })
        .expect(200, { message: 'Project joined by group' })
      const newgroupId = await createGroupWithFields(studentId, {
        name: 'Progchamps',
        description: 'description',
        size: 1
      })
      await request(app)
        .get('/group/recommendedprojects')
        .query({ gId: newgroupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [] })
    }, 10000)
    test('No projects to recommend', async () => {
      const groupId = await createGroup('progchamps', studentId)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/recommendedprojects')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [] })
    })
  })
  describe('error', () => {
    test('Invalid gId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/recommendedprojects')
        .query({ gId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'Group not found' })
    })
    test('User is not group member', async () => {
      const groupId = await createGroup('progchamps', studentId)
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .get('/group/recommendedprojects')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, { error: 'Forbidden: User is not group member' })
    })
  })
})

describe('GET /group/recommendedusers', () => {
  describe('success', () => {
    test('Recommended users who have shared their profile to every member of group', async () => {
      await togglevisibility(student2Id)
      var res = await login('adam@student.com', 'Password123?')
      const groupId = await createGroup('Progchamps', studentId)
      await request(app)
        .get('/group/recommendedusers')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: []
        })
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, shareToId: studentId })
        .expect(200)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/recommendedusers')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: [
            {
              id: student2Id,
              firstName: 'adam',
              lastName: 'chen',
              email: 'adam@student2.com',
              phoneNumber: null,
              school: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              courses: [],
              degree: null,
              groups: [],
              workExperience: [],
              skills: []
            }
          ]
        })
      const student3Id = await register(
        'adam',
        'chen',
        'adam@student3.com',
        'Password123?',
        UserType.STUDENT
      )
      var res = await login('adam@student3.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student3Id, gId: groupId })
        .expect(200)
      await request(app)
        .get('/group/recommendedusers')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: []
        })
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, shareToId: student3Id })
        .expect(200)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/recommendedusers')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: [
            {
              id: student2Id,
              firstName: 'adam',
              lastName: 'chen',
              email: 'adam@student2.com',
              phoneNumber: null,
              school: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              courses: [],
              degree: null,
              groups: [],
              workExperience: [],
              skills: []
            }
          ]
        })
    }, 20000)
    test('Recommended users who are public', async () => {
      togglevisibility(student2Id)
      var res = await login('adam@student.com', 'Password123?')
      const groupId = await createGroup('Progchamps', studentId)
      await request(app)
        .get('/group/recommendedusers')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: []
        })
      togglevisibility(student2Id)
      await request(app)
        .get('/group/recommendedusers')
        .query({ gId: groupId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          users: [
            {
              id: student2Id,
              firstName: 'adam',
              lastName: 'chen',
              email: 'adam@student2.com',
              phoneNumber: null,
              school: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              courses: [],
              degree: null,
              groups: [],
              workExperience: [],
              skills: []
            }
          ]
        })
    }, 10000)
  })
})

describe('GET /user/recommendedgroups', () => {
  describe('success', () => {
    test('Recommended groups where all members have shared profiles', async () => {
      await togglevisibility(student2Id)
      const groupId = await createGroupWithFields(student2Id, {
        name: 'Progchamps',
        description: 'We love scrumming',
        size: 5
      })
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedgroups')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          groups: []
        })
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, shareToId: studentId })
        .expect(200)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedgroups')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          groups: [
            {
              id: groupId,
              name: 'Progchamps',
              project: null,
              size: 5,
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              description: 'We love scrumming',
              members: [
                {
                  avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
                  email: 'adam@student2.com',
                  firstName: 'adam',
                  id: student2Id,
                  lastName: 'chen'
                }
              ],
              skills: []
            }
          ]
        })
      const student3Id = await register(
        'adam',
        'chen',
        'adam@student3.com',
        'Password123?',
        UserType.STUDENT
      )
      var res = await login('adam@student3.com', 'Password123?')
      togglevisibility(student3Id)
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student3Id, gId: groupId })
        .expect(200)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedgroups')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          groups: []
        })
      var res = await login('adam@student3.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student3Id, shareToId: studentId })
        .expect(200)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedgroups')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          groups: [
            {
              id: groupId,
              name: 'Progchamps',
              project: null,
              size: 5,
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              description: 'We love scrumming',
              members: [
                {
                  avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
                  email: 'adam@student2.com',
                  firstName: 'adam',
                  id: student2Id,
                  lastName: 'chen'
                },
                {
                  avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
                  email: 'adam@student3.com',
                  firstName: 'adam',
                  id: student3Id,
                  lastName: 'chen'
                }
              ],
              skills: []
            }
          ]
        })
    }, 20000)
    test('Recommended groups which have public members', async () => {
      const groupId = await createGroup('Progchamps', student2Id)
      await togglevisibility(student2Id)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedgroups')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          groups: []
        })
      await togglevisibility(student2Id)
      await request(app)
        .get('/user/recommendedgroups')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          groups: [
            {
              id: groupId,
              name: 'Progchamps',
              project: null,
              size: 2,
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              description: 'We love scrumming',
              members: [
                {
                  avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
                  email: 'adam@student2.com',
                  firstName: 'adam',
                  id: student2Id,
                  lastName: 'chen'
                }
              ],
              skills: []
            }
          ]
        })
    }, 10000)
  })
  describe('error', () => {
    test('Invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedgroups')
        .query({ uId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'User not found' })
    })
  })
})

describe('GET /user/recommendedprojects', () => {
  const project1Fields = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: '1',
    minGroupSize: '1',
    maxGroupCount: '2',
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  describe('success', () => {
    test('Recommended projects', async () => {
      const project1Id = await createProject(project1Fields, academicAdminId)
      var res = await login('adam@student.com', 'Password123?')
      let expectedProject1 = project1Fields
      expectedProject1.id = project1Id
      await request(app)
        .get('/user/recommendedprojects')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [expectedProject1] })
    })
    test('Not recommended projects which their group has already joined', async () => {
      const project1Id = await createProject(project1Fields, academicAdminId)
      var res = await login('adam@student.com', 'Password123?')
      const groupId = await createGroupWithFields(studentId, {
        name: 'Progchamps',
        description: 'description',
        size: 1
      })
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, pId: project1Id })
        .expect(200, { message: 'Project joined by group' })
      await request(app)
        .get('/user/recommendedprojects')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [] })
    }, 10000)
    test('No projects to recommend', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedprojects')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [] })
    })
  })
  describe('error', () => {
    test('Invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/recommendedprojects')
        .query({ uId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'User not found' })
    })
  })
})

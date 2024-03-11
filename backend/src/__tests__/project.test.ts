import { afterAll, beforeEach, test, describe, expect, vi } from 'vitest'
import { UserType } from '@prisma/client'
import request from 'supertest'
import { app } from '../index.js'
import {
  login,
  register,
  createProjectShort,
  createProject,
  createGroupWithFields
} from './test-utils.ts'
import prisma from '../../libs/__mocks__/prisma.ts'

vi.mock('../../libs/utils.ts')
vi.mock('../../libs/prisma.ts')

let studentId: string,
  adminId: string,
  academicAdminId: string,
  academicId: string,
  academic2Id: string,
  invalidId: string

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
  academicId = await register(
    'academic',
    'tran',
    'academic@staff.com',
    'Password123?',
    UserType.ACADEMIC
  )
  academic2Id = await register(
    'academic',
    'two',
    'second@staff.com',
    'Password123?',
    UserType.ACADEMIC
  )

  invalidId = studentId + adminId + academicAdminId + adminId + 'invalid'
})

afterAll(async () => {
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
})

const projectFields = {
  title: 'Course Insight and Skills Alignment Platform',
  description: 'test description',
  scope: 'requirements and scope',
  topics: ['test topic'],
  requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
  outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
  maxGroupSize: '5',
  minGroupSize: '3',
  maxGroupCount: '5'
}

describe('POST /project/add', () => {
  describe('success', () => {
    test('Academic can add project', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .post('/project/add')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send(projectFields)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('pId')
          expect(typeof res.body.pId).toBe('string')
        })
    })
    test('Academic admin can add project', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .post('/project/add')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send(projectFields)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('pId')
          expect(typeof res.body.pId).toBe('string')
        })
    })
    test('Academic can add project with missing optional fields', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .post('/project/add')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          title: 'Course Insight and Skills Alignment Platform',
          description: 'test description',
          scope: 'requirements and scope',
          topics: ['test topic'],
          requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
          outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
          minGroupSize: '3'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('pId')
          expect(typeof res.body.pId).toBe('string')
        })
    })
  })
  describe('error', () => {
    test('Academic cannot add project with missing required fields', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .post('/project/add')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          description: 'test description',
          scope: 'requirements and scope',
          topics: ['test topic'],
          requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
          outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
          minGroupSize: '3'
        })
        .expect(400, { error: 'Missing required fields' })
    })
    test('Numeric fields must be numbers', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .post('/project/add')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          title: 'Course Insight and Skills Alignment Platform',
          description: 'test description',
          scope: 'requirements and scope',
          topics: ['test topic'],
          requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
          outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
          minGroupSize: 'invalid'
        })
        .expect(400, { error: 'Numeric fields must be numbers' })
    })
    test('Min group size cannot be greater than max', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .post('/project/add')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          title: 'Course Insight and Skills Alignment Platform',
          description: 'test description',
          scope: 'requirements and scope',
          topics: ['test topic'],
          requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
          outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
          maxGroupSize: '3',
          minGroupSize: '5'
        })
        .expect(400, {
          error: 'Min group size cannot be greater than max'
        })
    })
    test('Non-academic cannot add project', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/project/add')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send(projectFields)
        .expect(403, { error: 'Forbidden: User does not have authorized role' })
    })
    test('Max group count must be greater than zero', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .post('/project/add')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          title: 'Course Insight and Skills Alignment Platform',
          description: 'test description',
          scope: 'requirements and scope',
          topics: ['test topic'],
          requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
          outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
          maxGroupCount: '-1'
        })
        .expect(400, {
          error: 'Max group count must be greater than 0'
        })
    })
  })
})

describe('GET /projects/owned', () => {
  let projectId: string
  var projectFieldsId = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: 5,
    minGroupSize: null,
    maxGroupCount: null,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    var res = await login('academic@staff.com', 'Password123?')
    const project = await request(app)
      .post('/project/add')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send(projectFieldsId)
      .expect(200)
    projectId = project.body.pId
    projectFieldsId.id = projectId
  })
  describe('success', () => {
    test('Academic can get projects owned', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .get('/projects/owned')
        .query({ uId: academicId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [projectFieldsId] })
    })
    test('Academic admin can get projects owned', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .get('/projects/owned')
        .query({ uId: academicId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { projects: [projectFieldsId] })
    })
  })
  describe('error', () => {
    test('Non-academic cannot get projects owned', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/projects/owned')
        .query({ uId: academicId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error:
            'Forbidden: User id does not match authorized user or user is not an academic'
        })
    })
    test('Academic cannot get projects owned by another academic', async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .get('/projects/owned')
        .query({ uId: academicId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error:
            'Forbidden: User id does not match authorized user or user is not an academic'
        })
    })
  })
})

describe('GET /project', () => {
  let projectId: string
  var projectFieldsId = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: 5,
    minGroupSize: null,
    maxGroupCount: null,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    var res = await login('academic@staff.com', 'Password123?')
    const project = await request(app)
      .post('/project/add')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send(projectFieldsId)
      .expect(200)
    projectId = project.body.pId
    projectFieldsId.id = projectId
  })
  describe('success', () => {
    test('Student gets a project', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: projectFieldsId })
    })
    test('Academic gets a project', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: projectFieldsId })
    })
    test('Admin gets a project', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: projectFieldsId })
    })
    test('Academic Admin gets a project', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: projectFieldsId })
    })
  })
  describe('error', () => {
    test('Project does not exist', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: invalidId })
        .expect(400, { error: 'Project not found' })
    })
  })
})

describe('GET /projects/all', () => {
  let project1Id: string, project2Id: string
  let expected = {
    projects: [
      {
        id: '',
        title: 'project one',
        description: 'desc1',
        scope: 'This is the scope of the project',
        topics: ['test topic'],
        requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
        outcomes: ['Documentation', 'Testing', 'Web Application'],
        maxGroupSize: null,
        minGroupSize: null,
        maxGroupCount: null,
        coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
      },
      {
        id: '',
        title: 'project two',
        description: 'desc2',
        scope: 'This is the scope of the project',
        topics: ['test topic'],
        requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
        outcomes: ['Documentation', 'Testing', 'Web Application'],
        maxGroupSize: null,
        minGroupSize: null,
        maxGroupCount: null,
        coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
      }
    ]
  }
  beforeEach(async () => {
    project1Id = await createProjectShort('project one', academicId, 'desc1')
    project2Id = await createProjectShort('project two', academic2Id, 'desc2')
    expected.projects[0].id = project1Id
    expected.projects[1].id = project2Id
  })
  describe('success', () => {
    test('Student gets a project', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/projects/all')
        .set('Cookie', res.headers['set-cookie'])
        .expect(200, expected)
    })
    test('Academic gets a project', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .get('/projects/all')
        .set('Cookie', res.headers['set-cookie'])
        .expect(200, expected)
    })
    test('Admin gets a project', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/projects/all')
        .set('Cookie', res.headers['set-cookie'])
        .expect(200, expected)
    })
    test('Academic Admin gets a project', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .get('/projects/all')
        .set('Cookie', res.headers['set-cookie'])
        .expect(200, expected)
    })
  })
  describe('error', () => {
    test('Not logged in', async () => {
      await request(app)
        .get('/projects/all')
        .query({ pId: invalidId })
        .expect(401)
    })
  })
})

describe('PUT /project/settitle', () => {
  let projectId: string
  let expected = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'This is the project description',
    scope: 'This is the scope of the project',
    topics: ['test topic'],
    requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
    outcomes: ['Documentation', 'Testing', 'Web Application'],
    maxGroupSize: null,
    minGroupSize: null,
    maxGroupCount: null,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    projectId = await createProjectShort(
      'Course Insight and Skills Alignment Platform',
      academicId,
      'This is the project description'
    )
    expected.id = projectId
  })
  describe('success', () => {
    test('Project owner sets title', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/settitle')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, title: 'CISAP' })
        .expect(200, { message: 'Title updated' })
      expected.title = 'CISAP'
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Academic admin sets title', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .put('/project/settitle')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, title: 'CISAP' })
        .expect(200, { message: 'Title updated' })
      expected.title = 'CISAP'
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
  })
  describe('error', () => {
    test('Non-owner academic cannot set title', async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .put('/project/settitle')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, title: 'CISAP' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Non-owner student cannot set title', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/project/settitle')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, title: 'CISAP' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Cannot set title to an empty string', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/settitle')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, title: '' })
        .expect(400, { error: 'Missing title' })
    })
  })
})

describe('PUT /project/setdescription', () => {
  let projectId: string
  let expected = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'This is the project description',
    scope: 'This is the scope of the project',
    topics: ['test topic'],
    requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
    outcomes: ['Documentation', 'Testing', 'Web Application'],
    maxGroupSize: null,
    minGroupSize: null,
    maxGroupCount: null,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    projectId = await createProjectShort(
      'Course Insight and Skills Alignment Platform',
      academicId,
      'This is the project description'
    )
    expected.id = projectId
  })
  describe('success', () => {
    test('Project owner sets description', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setdescription')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, description: 'new desc' })
        .expect(200, { message: 'Description updated' })
      expected.description = 'new desc'
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Academic admin sets description', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .put('/project/setdescription')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, description: 'new desc' })
        .expect(200, { message: 'Description updated' })
      expected.description = 'new desc'
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
  })
  describe('error', () => {
    test('Non-owner academic cannot set description', async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .put('/project/setdescription')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, description: 'new desc' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Non-owner student cannot set description', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/project/setdescription')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, description: 'new desc' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Cannot set description to an empty string', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setdescription')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, description: '' })
        .expect(400, { error: 'Missing description' })
    })
  })
})

describe('PUT /project/settopics', () => {
  let projectId: string
  let expected = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'This is the project description',
    scope: 'This is the scope of the project',
    topics: ['test topic'],
    requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
    outcomes: ['Documentation', 'Testing', 'Web Application'],
    maxGroupSize: null,
    minGroupSize: null,
    maxGroupCount: null,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    projectId = await createProjectShort(
      'Course Insight and Skills Alignment Platform',
      academicId,
      'This is the project description'
    )
    expected.id = projectId
  })
  describe('success', () => {
    test('Project owner sets topics', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/settopics')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, topics: ['topic1', 'topic2'] })
        .expect(200, { message: 'Topics updated' })
      expected.topics = ['topic1', 'topic2']
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Academic admin sets topics', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .put('/project/settopics')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, topics: ['topic1', 'topic2'] })
        .expect(200, { message: 'Topics updated' })
      expected.topics = ['topic1', 'topic2']
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
  })
  describe('error', () => {
    test('Non-owner academic cannot set topics', async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .put('/project/settopics')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, topics: ['topic1', 'topic2'] })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Non-owner student cannot set topics', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/project/settopics')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, topics: ['topic1', 'topic2'] })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
  })
})

describe('PUT /project/setscope', () => {
  let projectId: string
  let expected = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'This is the project description',
    scope: 'This is the scope of the project',
    topics: ['test topic'],
    requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
    outcomes: ['Documentation', 'Testing', 'Web Application'],
    maxGroupSize: null,
    minGroupSize: null,
    maxGroupCount: null,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    projectId = await createProjectShort(
      'Course Insight and Skills Alignment Platform',
      academicId,
      'This is the project description'
    )
    expected.id = projectId
  })
  describe('success', () => {
    test('Project owner sets scope', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setscope')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, scope: 'new scope' })
        .expect(200, { message: 'Scope updated' })
      expected.scope = 'new scope'
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Academic admin sets scope', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .put('/project/setscope')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, scope: 'new scope' })
        .expect(200, { message: 'Scope updated' })
      expected.scope = 'new scope'
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
  })
  describe('error', () => {
    test('Non-owner academic cannot set scope', async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .put('/project/setscope')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, scope: 'new scope' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Non-owner student cannot set scope', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/project/setscope')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, scope: 'new scope' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Cannot set scope to an empty string', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setscope')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, scope: '' })
        .expect(400, { error: 'Missing scope' })
    })
  })
})

describe('PUT /project/setrequiredskills', () => {
  let projectId: string
  let expected = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'This is the project description',
    scope: 'This is the scope of the project',
    topics: ['test topic'],
    requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
    outcomes: ['Documentation', 'Testing', 'Web Application'],
    maxGroupSize: null,
    minGroupSize: null,
    maxGroupCount: null,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    projectId = await createProjectShort(
      'Course Insight and Skills Alignment Platform',
      academicId,
      'This is the project description'
    )
    expected.id = projectId
  })
  describe('success', () => {
    test('Project owner sets required skills', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setrequiredskills')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, requiredSkills: ['skill1', 'skill2'] })
        .expect(200, { message: 'Required skills updated' })
      expected.requiredSkills = ['skill1', 'skill2']
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Academic admin sets required skills', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .put('/project/setrequiredskills')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, requiredSkills: ['skill1', 'skill2'] })
        .expect(200, { message: 'Required skills updated' })
      expected.requiredSkills = ['skill1', 'skill2']
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
  })
  describe('error', () => {
    test('Non-owner academic cannot set required skills', async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .put('/project/setrequiredskills')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, requiredSkills: ['topic1', 'skill2'] })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Non-owner student cannot set required skills', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/project/setrequiredskills')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, requiredSkills: ['topic1', 'skill2'] })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
  })
})

describe('PUT /project/setoutcomes', () => {
  let projectId: string
  let expected = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'This is the project description',
    scope: 'This is the scope of the project',
    topics: ['test topic'],
    requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
    outcomes: ['Documentation', 'Testing', 'Web Application'],
    maxGroupSize: null,
    minGroupSize: null,
    maxGroupCount: null,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    projectId = await createProjectShort(
      'Course Insight and Skills Alignment Platform',
      academicId,
      'This is the project description'
    )
    expected.id = projectId
  })
  describe('success', () => {
    test('Project owner sets outcomes', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setoutcomes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, outcomes: ['outcome1', 'outcome2'] })
        .expect(200, { message: 'Outcomes updated' })
      expected.outcomes = ['outcome1', 'outcome2']
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Academic admin sets outcomes', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .put('/project/setoutcomes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, outcomes: ['outcome1', 'outcome2'] })
        .expect(200, { message: 'Outcomes updated' })
      expected.outcomes = ['outcome1', 'outcome2']
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
  })
  describe('error', () => {
    test('Non-owner academic cannot set outcomes', async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .put('/project/setoutcomes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, outcomes: ['outcome1', 'outcome2'] })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Non-owner student cannot set outcomes', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/project/setoutcomes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, outcomes: ['outcome1', 'outcome2'] })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
  })
})

describe('PUT /project/setgroupsizes', () => {
  let projectId: string
  let expected = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: 5,
    minGroupSize: 1,
    maxGroupCount: 5,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    var res = await login('academic@staff.com', 'Password123?')
    res = await request(app)
      .post('/project/add')
      .set('Cookie', res.headers['set-cookie'])
      .send(projectFields)
    projectId = res.body.pId
    expected.id = projectId
  })
  describe('success', () => {
    test('Project owner sets min and max group size', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setgroupsizes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, minGroupSize: '1', maxGroupSize: '5' })
        .expect(200, { message: 'Max and min group size updated' })
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Project owner sets min group size to null', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      let expected = {
        id: projectId,
        title: 'Course Insight and Skills Alignment Platform',
        description: 'test description',
        scope: 'requirements and scope',
        topics: ['test topic'],
        requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
        outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
        maxGroupSize: 5,
        minGroupSize: null,
        maxGroupCount: 5,
        coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
      }
      await request(app)
        .put('/project/setgroupsizes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, minGroupSize: null, maxGroupSize: '5' })
        .expect(200, { message: 'Max and min group size updated' })
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Project owner sets max group size to null', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      let expected = {
        id: projectId,
        title: 'Course Insight and Skills Alignment Platform',
        description: 'test description',
        scope: 'requirements and scope',
        topics: ['test topic'],
        requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
        outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
        maxGroupSize: null,
        minGroupSize: 1,
        maxGroupCount: 5,
        coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
      }
      await request(app)
        .put('/project/setgroupsizes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, minGroupSize: '1', maxGroupSize: null })
        .expect(200, { message: 'Max and min group size updated' })
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Academic admin sets min and max group size', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .put('/project/setgroupsizes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, minGroupSize: '1', maxGroupSize: '5' })
        .expect(200, { message: 'Max and min group size updated' })
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
  })
  describe('error', () => {
    test('Non-owner academic cannot set group size', async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .put('/project/setgroupsizes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, minGroupSize: '1', maxGroupSize: '5' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Non-owner student cannot set group size', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/project/setgroupsizes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, minGroupSize: '1', maxGroupSize: '5' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Cannot set min group size to less than max group size', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setgroupsizes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, minGroupSize: '6', maxGroupSize: '5' })
        .expect(400, {
          error: 'Cannot set max group size to less than min group size'
        })
    })
    test('Cannot set min group size to less than 1', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setgroupsizes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, minGroupSize: '0', maxGroupSize: '5' })
        .expect(400, {
          error: 'Min group count must be greater than 0'
        })
    })
    test('Cannot set max group size to less than 1', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setgroupsizes')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, minGroupSize: '0', maxGroupSize: '0' })
        .expect(400, {
          error: 'Max group count must be greater than 0'
        })
    })
  })
})

describe('PUT /project/maxgroupcount', () => {
  let projectId: string
  let expected = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: 5,
    minGroupSize: 3,
    maxGroupCount: 100,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    var res = await login('academic@staff.com', 'Password123?')
    res = await request(app)
      .post('/project/add')
      .set('Cookie', res.headers['set-cookie'])
      .send(projectFields)
    projectId = res.body.pId
    expected.id = projectId
  })
  describe('success', () => {
    test('Project owner sets max group count', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setmaxgroupcount')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, maxGroupCount: '100' })
        .expect(200, { message: 'Max group count updated' })
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Project owner sets max group count to null', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      let expected = {
        id: projectId,
        title: 'Course Insight and Skills Alignment Platform',
        description: 'test description',
        scope: 'requirements and scope',
        topics: ['test topic'],
        requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
        outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: null,
        coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
      }
      await request(app)
        .put('/project/setmaxgroupcount')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, maxGroupCount: null })
        .expect(200, { message: 'Max group count updated' })
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
    test('Academic admin sets max group count', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .put('/project/setmaxgroupcount')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, maxGroupCount: '100' })
        .expect(200, { message: 'Max group count updated' })
      await request(app)
        .get('/project')
        .set('Cookie', res.headers['set-cookie'])
        .query({ pId: projectId })
        .expect(200, { project: expected })
    })
  })
  describe('error', () => {
    test('Non-owner academic cannot set max group count', async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .put('/project/setmaxgroupcount')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, maxGroupCount: '100' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Non-owner student cannot set max group count', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/project/setmaxgroupcount')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, maxGroupCount: '100' })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('Cannot set max group count to less than 1', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setmaxgroupcount')
        .set('Cookie', res.headers['set-cookie'])
        .send({ pId: projectId, maxGroupCount: '0' })
        .expect(400, {
          error: 'Min group count must be greater than 0'
        })
    })
  })
})

describe('DELETE /project', () => {
  let projectId: string
  var projectFieldsId = {
    id: '',
    title: 'Course Insight and Skills Alignment Platform',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: 5,
    minGroupSize: null,
    maxGroupCount: null,
    coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
  }
  beforeEach(async () => {
    var res = await login('academic@staff.com', 'Password123?')
    const project = await request(app)
      .post('/project/add')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send(projectFieldsId)
      .expect(200)
    projectId = project.body.pId
    projectFieldsId.id = projectId
  })
  describe('success', () => {
    test('Academic can delete project', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .delete('/project')
        .query({ pId: projectId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'Project deleted' })
    })
    test('Academic admin can delete project', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .delete('/project')
        .query({ pId: projectId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'Project deleted' })
    })
  })

  describe('error', () => {
    test('Non-academic cannot delete project', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/project')
        .query({ pId: projectId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test("Academic cannot delete another academic's project", async () => {
      var res = await login('second@staff.com', 'Password123?')
      await request(app)
        .delete('/project')
        .send({ pId: projectId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
  })
})

describe('GET /project/userjoinablegroups', () => {
  const projectFieldsSmallGroup = {
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
  const projectFieldsBigGroup = {
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
  let group1Id: String
  let group2Id: String
  let projectSmallGroupId: string
  let projectBigGroupId: string
  beforeEach(async () => {
    projectSmallGroupId = await createProject(
      projectFieldsSmallGroup,
      academicAdminId
    )
    projectBigGroupId = await createProject(
      projectFieldsBigGroup,
      academicAdminId
    )
    group1Id = await createGroupWithFields(studentId, { name: 'Progchamps', description: 'description', size: 1 })
    group2Id = await createGroupWithFields(studentId, { name: 'Progchamps', description: 'description', size: 2 })
  })
  describe('success', async () => {
    test('User can see which groups can join project', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project/userjoinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId, pId: projectSmallGroupId })
        .expect(200, {
          groups: [
            {
              id: group1Id,
              name: 'Progchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg'
            },
          ]
        })
    })
    test('groups which are not full do not appear', async () => {
      const student2Id = await register(
        'adam',
        'chen',
        'adam@student2.com',
        'Password123?',
        UserType.STUDENT
      )
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project/userjoinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId, pId: projectBigGroupId })
        .expect(200, {
          groups: []
        })
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: group2Id })
        .expect(200, { message: 'Joined group Progchamps' })
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project/userjoinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId, pId: projectBigGroupId })
        .expect(200, {
          groups: [
            {
              id: group2Id,
              name: 'Progchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg'
            },
          ]
        })
    })

    test('groups which are too big do not appear', async () => {
      const student2Id = await register(
        'adam',
        'chen',
        'adam@student2.com',
        'Password123?',
        UserType.STUDENT
      )
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: group2Id })
        .expect(200, { message: 'Joined group Progchamps' })
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project/userjoinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId, pId: projectSmallGroupId })
        .expect(200, {
          groups: [{
            id: group1Id,
            name: 'Progchamps',
            coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg'
          },]
        })
    })
    test('groups which are too small do not appear', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project/userjoinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId, pId: projectBigGroupId })
        .expect(200, {
          groups: []
        })
    })
  })
  describe('errors', async () => {
    test('invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project/userjoinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: invalidId, pId: projectBigGroupId })
        .expect(400, { error: 'User not found' })
    })
    test('invalid pId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project/userjoinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId, pId: invalidId })
        .expect(400, { error: 'Project not found' })
    })
  })
})

describe('GET /project/joinablegroups', () => {
  const projectFieldsSmallGroup = {
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
  const projectFieldsBigGroup = {
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
  let group1Id: String
  let group2Id: String
  let projectSmallGroupId: string
  let projectBigGroupId: string
  beforeEach(async () => {
    projectSmallGroupId = await createProject(
      projectFieldsSmallGroup,
      academicAdminId
    )
    projectBigGroupId = await createProject(
      projectFieldsBigGroup,
      academicAdminId
    )
    group1Id = await createGroupWithFields(studentId, { name: 'Progchamps', description: 'description', size: 1 })
    group2Id = await createGroupWithFields(studentId, { name: 'Progchamps', description: 'description', size: 2 })
  })
  describe('success', async () => {
    test('Owner can see which groups can join project', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .get('/project/joinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: projectSmallGroupId })
        .expect(200, {
          groups: [
            {
              id: group1Id,
              name: 'Progchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg'
            },
          ]
        })
    })
    test('groups which are not full do not appear', async () => {
      const student2Id = await register(
        'adam',
        'chen',
        'adam@student2.com',
        'Password123?',
        UserType.STUDENT
      )
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .get('/project/joinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: projectBigGroupId })
        .expect(200, {
          groups: []
        })
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: group2Id })
        .expect(200, { message: 'Joined group Progchamps' })
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .get('/project/joinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: projectBigGroupId })
        .expect(200, {
          groups: [
            {
              id: group2Id,
              name: 'Progchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg'
            },
          ]
        })
    })
    test('groups which are too big do not appear', async () => {
      const student2Id = await register(
        'adam',
        'chen',
        'adam@student2.com',
        'Password123?',
        UserType.STUDENT
      )
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: group2Id })
        .expect(200, { message: 'Joined group Progchamps' })
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .get('/project/joinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: projectSmallGroupId })
        .expect(200, {
          groups: [{
            id: group1Id,
            name: 'Progchamps',
            coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg'
          },]
        })
    })
    test('groups which are too small do not appear', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .get('/project/joinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: projectBigGroupId })
        .expect(200, {
          groups: []
        })
    })
  })
  describe('errors', async () => {
    test('Non project owner cannot view groups', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/project/joinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: projectBigGroupId })
        .expect(403, { error: 'Forbidden: User is not project owner' })
    })
    test('invalid pId', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .get('/project/joinablegroups')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: invalidId })
        .expect(400, { error: 'Project not found' })
    })
  })
})

describe('PUT /project/setcoverphoto', () => {
  let projectId: string
  beforeEach(async () => {
    projectId = await createProjectShort('CISAP', academicId, 'This is CISAP')
  })
  describe('success', () => {
    test('Project owner sets cover photo of their project', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: projectId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('imagePath')
          expect(typeof res.body.imagePath).toBe('string')
        })
    })
    test('Academic admin sets another projects cover photo', async () => {
      var res = await login('jon@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: projectId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '600',
          topLeftY: '400',
          width: '600',
          height: '437'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('imagePath')
          expect(typeof res.body.imagePath).toBe('string')
        })
    })
  })
  describe('error', () => {
    test('Missing pId', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Missing pId' })
    })
    test('Missing imageUrl', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: projectId,
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Missing topLeftX', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: projectId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Missing topLeftY', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: projectId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Missing width', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: projectId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          height: '837'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Missing height', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: projectId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Invalid uId', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: invalidId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Project not found' })
    })
    test('Invalid imageUrl', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: projectId,
          imageUrl: 'invalid',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Invalid image url' })
    })
    test('Invalid dimensions', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      await request(app)
        .put('/project/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          pId: projectId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '0',
          height: '837'
        })
        .expect(400, { error: 'Invalid cropping dimensions' })
    })
  })
})

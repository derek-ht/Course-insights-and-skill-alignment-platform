import { afterAll, beforeEach, test, describe, expect, vi } from 'vitest'
import { UserType } from '@prisma/client'
import request from 'supertest'
import { app } from '../index.js'
import {
  login,
  register,
  createGroup,
  createProject,
  getProjectFromGroup,
  createGroupWithFields,
  joinGroup,
  requestJoinGroup,
  inviteUserToGroup
} from './test-utils.ts'
import prisma from '../../libs/__mocks__/prisma.ts'

let studentId: string,
  student2Id: string,
  student3Id: string,
  adminId: string,
  academicAdminId: string,
  academicId: string,
  academic2Id: string,
  invalidId: string

vi.mock('../../libs/prisma.ts')
vi.mock('../../libs/utils.ts')

beforeEach(async () => {
  await prisma.group.deleteMany()
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
  student2Id = await register(
    'adam',
    'chen',
    'adam@student2.com',
    'Password123?',
    UserType.STUDENT
  )
  student3Id = await register(
    'adam',
    'chen',
    'adam@student3.com',
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
  await prisma.group.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /group/create', () => {
  describe('Success', () => {
    test('User can create group without specifying unrequired fields', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/create')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, name: 'Progchamps' })
        .expect(200)
    })
    test('User can create group specifying description', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/create')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          name: 'Progchamps',
          description: 'Derek is cool'
        })
        .expect(200)
    })
    test('User can create group specifying size', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/create')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, name: 'Progchamps', size: 12 })
        .expect(200)
    })
  })
  describe('error', () => {
    test('User cannot create group without name', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/create')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId })
        .expect(400, { error: 'Missing group name' })
    })
  })
})

describe('GET /group', () => {
  let groupDefaultId: string
  let groupWithDescriptionId: string
  let groupWithSizeId: string
  let groupDefaultFields: {
    name
    description
    members
    coverPhoto
    size
    project
    skills
  }
  let groupWithDescriptionFields: {
    name
    description
    members
    coverPhoto
    size
    project
    skills
  }
  let groupWithSizeFields: {
    name
    description
    members
    coverPhoto
    size
    project
    skills
  }
  beforeEach(async () => {
    groupDefaultFields = {
      name: 'Progchamps',
      description: '',
      members: [
        {
          id: studentId,
          firstName: 'adam',
          lastName: 'chen',
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          skills: []
        }
      ],
      coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
      size: 5,
      project: null,
      skills: []
    }
    groupWithDescriptionFields = {
      name: 'Progchamps',
      description: 'Derek is cool',
      members: [
        {
          id: studentId,
          firstName: 'adam',
          lastName: 'chen',
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          skills: []
        }
      ],
      coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
      size: 5,
      project: null,
      skills: []
    }
    groupWithSizeFields = {
      name: 'Progchamps',
      description: '',
      members: [
        {
          id: studentId,
          firstName: 'adam',
          lastName: 'chen',
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          skills: []
        }
      ],
      coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
      size: 12,
      project: null,
      skills: []
    }
    var { name, description, size } = groupDefaultFields
    groupDefaultId = await createGroupWithFields(studentId, {
      name: name,
      description: description,
      size: size
    })
    var { name, description, size } = groupWithDescriptionFields
    groupWithDescriptionId = await createGroupWithFields(studentId, {
      name: name,
      description: description,
      size: size
    })
    var { name, description, size } = groupWithSizeFields
    groupWithSizeId = await createGroupWithFields(studentId, {
      name: name,
      description: description,
      size: size
    })
  })

  describe('success', () => {
    test('Get group with defaulted fields', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group')
        .query({ gId: groupDefaultId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { group: groupDefaultFields })
    })
    test('Get group with specified description', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group')
        .query({ gId: groupWithDescriptionId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { group: groupWithDescriptionFields })
    })
    test('Get group with specified description', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group')
        .query({ gId: groupWithSizeId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { group: groupWithSizeFields })
    })
  })
})

describe('POST /group/join', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('Member is able to join group', async () => {
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Joined group Progchamps' })
    })
  })
  describe('errors', () => {
    test('Member is unable to join full group', async () => {
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Joined group Progchamps' })
      var res = await login('adam@student3.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student3Id, gId: groupId })
        .expect(400, { error: 'No more space for new members' })
    })
  })
})

describe('POST /group/leave', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('User successfully leaves group', async () => {
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Joined group Progchamps' })
      await request(app)
        .post('/group/leave')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Left group Progchamps' })
    })
  })
})

describe('PUT /group/updatename', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('Member updates name', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/updatename')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, name: 'New name' })
        .expect(200, { message: 'Group name updated' })
      await request(app)
        .get('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200)
        .expect((res) => {
          expect(res.body.group.name).toBe('New name')
        })
    })
    test('Admin updates name', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/group/updatename')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, name: 'New name' })
        .expect(200, { message: 'Group name updated' })
      await request(app)
        .get('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200)
        .expect((res) => {
          expect(res.body.group.name).toBe('New name')
        })
    })
  })
  describe('error', () => {
    test('Member updates name to an empty string', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/updatename')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, name: '' })
        .expect(400, { error: 'Missing name' })
    })
  })
})

describe('PUT /group/updatedescription', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('Member updates description', async () => {
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Joined group Progchamps' })
      await request(app)
        .put('/group/updatedescription')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
          description: 'Different description'
        })
        .expect(200, { message: 'Group description updated' })
      await request(app)
        .get('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200)
        .expect((res) => {
          expect(res.body.group.description).toBe('Different description')
        })
    })
  })
  describe('error', () => {
    test('Missing description', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/updatedescription')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId
        })
        .expect(400, { error: 'Missing description' })
    })
  })
})

describe('PUT /group/updatesize', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('Member updates size', async () => {
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Joined group Progchamps' })
      await request(app)
        .put('/group/updatesize')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, size: 10 })
        .expect(200, { message: 'Group size updated' })
    })
  })
  describe('error', () => {
    test('Member updates size to an invalid size', async () => {
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/join')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Joined group Progchamps' })
      await request(app)
        .put('/group/updatesize')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, size: 1 })
        .expect(400, { error: 'New group size is too small' })
    })
    test('Missing size field', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/updatesize')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId })
        .expect(400, { error: 'Missing size' })
    })
    test('Cannot parse size to int', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/updatesize')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, size: 'hello' })
        .expect(400, { error: 'Could not parse size to an integer' })
    })
  })
})

describe('PUT /group/setcoverphoto', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('progchamps', studentId)
  })
  describe('success', () => {
    test('Member sets cover photo of their group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
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
    test('Admin sets another groups cover photo', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
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
    test('Missing gId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Missing gId' })
    })
    test('Missing imageUrl', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Missing topLeftX', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Missing topLeftY', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Missing width', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          height: '837'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Missing height', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: invalidId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Group not found' })
    })
    test('Invalid imageUrl', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
          imageUrl: 'invalid',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Invalid image url' })
    })
    test('Invalid dimensions', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/group/setcoverphoto')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          gId: groupId,
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

describe('POST /group/joinproject', () => {
  const projectFieldsRegular = {
    title: 'Course Insight and Skills Alignment Platform',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: '1',
    minGroupSize: '1',
    maxGroupCount: '1'
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
    maxGroupCount: '1'
  }
  let groupId: string
  let projectRegularId: string
  let projectBigGroupId: string
  beforeEach(async () => {
    projectRegularId = await createProject(
      projectFieldsRegular,
      academicAdminId
    )
    projectBigGroupId = await createProject(
      projectFieldsBigGroup,
      academicAdminId
    )
    groupId = await createGroupWithFields(studentId, {
      name: 'progchamps',
      description: 'prog',
      size: 1
    })
  })
  describe('success', async () => {
    test('group can join project', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, pId: projectRegularId })
        .expect(200, { message: 'Project joined by group' })
    })
    let project = await getProjectFromGroup(groupId)
    expect(project).toEqual(projectRegularId)
  })
  describe('errors', async () => {
    test('group count exceeded', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, pId: projectRegularId })
        .expect(200, { message: 'Project joined by group' })
      let group2Id = await createGroupWithFields(student2Id, {
        name: 'dogchamps',
        description: 'dog',
        size: 1
      })
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: group2Id, pId: projectRegularId })
        .expect(400, { error: 'Max group count exceeded' })
    })
    test('group size exceeded', async () => {
      const largeGroupId = await createGroup('hogchamps', studentId)
      await joinGroup(largeGroupId, student2Id)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: largeGroupId, pId: projectRegularId })
        .expect(400, { error: 'Group size too big for project' })
    })
    test('group size too small', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, pId: projectBigGroupId })
        .expect(400, { error: 'Group size too small for project' })
    })
    test('invalid pId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, pId: invalidId })
        .expect(400, { error: 'Project not found' })
    })
    test('invalid gId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/joinproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: invalidId, pId: projectFieldsRegular })
        .expect(400, { error: 'Group not found' })
    })
  })
})

describe('GET /groups/all', () => {
  let groupId: string
  let groupId2: string
  let groupId3: string
  let groupId4: string
  let expected: {
    groups
  }
  beforeEach(async () => {
    groupId = await createGroupWithFields(studentId, {
      name: 'Progchamps',
      description: 'We love progging',
      size: 5
    })
    groupId2 = await createGroupWithFields(student2Id, {
      name: 'Scrummers',
      description: 'We love scrumming',
      size: 2
    })
    groupId3 = await createGroupWithFields(adminId, {
      name: 'adminsOnly',
      description: 'Admins rule',
      size: 4
    })
    groupId4 = await createGroupWithFields(student3Id, {
      name: 'Frogchamps',
      description: 'ribbit',
      size: 5
    })
    expected = {
      groups: [
        {
          id: groupId,
          name: 'Progchamps',
          description: 'We love progging',
          members: [{ id: studentId }],
          coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
          size: 5,
          project: null
        },
        {
          id: groupId2,
          name: 'Scrummers',
          description: 'We love scrumming',
          members: [{ id: studentId }, { id: student2Id }],
          coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
          size: 2,
          project: null
        },
        {
          id: groupId3,
          name: 'adminsOnly',
          description: 'Admins rule',
          members: [{ id: adminId }, { id: academicAdminId }],
          coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
          size: 4,
          project: null
        },
        {
          id: groupId4,
          name: 'Frogchamps',
          description: 'ribbit',
          members: [{ id: student3Id }],
          coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
          size: 5,
          project: null
        }
      ]
    }
    var res = await login('jon@staff.com', 'Password123?')
    await request(app)
      .post('/group/join')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({ uId: academicAdminId, gId: groupId3 })
      .expect(200, { message: 'Joined group adminsOnly' })
    await request(app)
      .post('/group/join')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({ uId: studentId, gId: groupId2 })
      .expect(200, { message: 'Joined group Scrummers' })
  })
  describe('success', () => {
    test('Get all groups', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/groups/all')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, expected)
    })
  })
})

describe('GET /groups/byproject', () => {
  let groupId: string
  let groupId2: string
  let groupId3: string
  let groupId4: string
  let expected1: { groups }
  let expected2: { groups }
  const projectFields1 = {
    title: 'Project One',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: '10',
    minGroupSize: '1',
    maxGroupCount: '10'
  }
  const projectFields2 = {
    title: 'Project Two',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: '10',
    minGroupSize: '1',
    maxGroupCount: '10'
  }
  const projectFields3 = {
    title: 'Project Three',
    description: 'test description',
    scope: 'requirements and scope',
    topics: ['test topic'],
    requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
    outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
    maxGroupSize: '10',
    minGroupSize: '1',
    maxGroupCount: '10'
  }
  let projectId1: string
  let projectId2: string
  let projectId3: string
  beforeEach(async () => {
    projectId1 = await createProject(projectFields1, academicAdminId)
    projectId2 = await createProject(projectFields2, academicAdminId)
    projectId3 = await createProject(projectFields3, academicAdminId)
    groupId = await createGroupWithFields(studentId, {
      name: 'Progchamps',
      description: 'We love progging',
      size: 1
    })
    groupId2 = await createGroupWithFields(student2Id, {
      name: 'Scrummers',
      description: 'We love scrumming',
      size: 1
    })
    groupId3 = await createGroupWithFields(adminId, {
      name: 'adminsOnly',
      description: 'Admins rule',
      size: 1
    })
    groupId4 = await createGroupWithFields(student3Id, {
      name: 'Frogchamps',
      description: 'ribbit',
      size: 1
    })
    var res = await login('jon@staff.com', 'Password123?')
    await request(app)
      .post('/group/joinproject')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({ gId: groupId, pId: projectId1 })
      .expect(200, { message: 'Project joined by group' })
    await request(app)
      .post('/group/joinproject')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({ gId: groupId2, pId: projectId1 })
      .expect(200, { message: 'Project joined by group' })
    await request(app)
      .post('/group/joinproject')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({ gId: groupId3, pId: projectId2 })
      .expect(200, { message: 'Project joined by group' })
    expected1 = {
      groups: [
        {
          id: groupId,
          name: 'Progchamps',
          description: 'We love progging',
          members: [{ id: studentId }],
          coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
          size: 1
        },
        {
          id: groupId2,
          name: 'Scrummers',
          description: 'We love scrumming',
          members: [{ id: student2Id }],
          coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
          size: 1
        }
      ]
    }
    expected2 = {
      groups: [
        {
          id: groupId3,
          name: 'adminsOnly',
          description: 'Admins rule',
          members: [{ id: adminId }],
          coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
          size: 1
        }
      ]
    }
  })
  describe('success', () => {
    test('Get all groups in project 1', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/groups/byproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: projectId1 })
        .expect(200, expected1)
    })
    test('Get all groups in project 2', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/groups/byproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: projectId2 })
        .expect(200, expected2)
    })
    test('Get all groups in empty project', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/groups/byproject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ pId: projectId3 })
        .expect(200, { groups: [] })
    })
  })
})

describe('GET /groups/recruiting', () => {
  let groupId: string
  let groupId2: string
  let groupId3: string
  beforeEach(async () => {
    groupId = await createGroupWithFields(studentId, {
      name: 'Progchamps',
      description: 'We love progging',
      size: 1
    })
    groupId2 = await createGroupWithFields(studentId, {
      name: 'Scrummers',
      description: 'We love scrumming',
      size: 3
    })
    groupId3 = await createGroupWithFields(studentId, {
      name: 'Frogchamps',
      description: 'ribbit',
      size: 3
    })
  })
  describe('success', () => {
    test('Get recruiting groups of a user', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/groups/recruiting')
        .query({ uId: student2Id })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          groups: [
            {
              id: groupId2,
              name: 'Scrummers',
              description: 'We love scrumming',
              members: [{ id: studentId }],
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              size: 3,
              project: null
            },
            {
              id: groupId3,
              name: 'Frogchamps',
              description: 'ribbit',
              members: [{ id: studentId }],
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              size: 3,
              project: null
            }
          ]
        })
    })
    test('Get recruiting groups of a user with no groups', async () => {
      var res = await login('adam@student2.com', 'Password123?')
      await request(app)
        .get('/groups/recruiting')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { groups: [] })
    })
    test('Recruiting groups filters out invited users', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await inviteUserToGroup(groupId2, student2Id)
      await request(app)
        .get('/groups/recruiting')
        .query({ uId: student2Id })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          groups: [
            {
              id: groupId3,
              name: 'Frogchamps',
              description: 'ribbit',
              members: [{ id: studentId }],
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              size: 3,
              project: null
            }
          ]
        })
      await request(app)
        .get('/groups/recruiting')
        .query({ uId: adminId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          groups: [
            {
              id: groupId2,
              name: 'Scrummers',
              description: 'We love scrumming',
              members: [{ id: studentId }],
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              size: 3,
              project: null
            },
            {
              id: groupId3,
              name: 'Frogchamps',
              description: 'ribbit',
              members: [{ id: studentId }],
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              size: 3,
              project: null
            }
          ]
        })
    })
  })
})

describe('DELETE /group', () => {
  let groupId: string
  beforeEach(async () => {
    prisma.group.deleteMany()
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('Member deletes group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, { message: 'Group deleted' })
      await request(app)
        .get('/groups/all')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { groups: [] })
    })
    test('Admin deletes group', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .delete('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, { message: 'Group deleted' })
      await request(app)
        .get('/groups/all')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { groups: [] })
    })
  })
  describe('error', () => {
    test('Group does not exist', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, { message: 'Group deleted' })
      await request(app)
        .delete('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(400, { error: 'Group not found' })
    })
  })
})

describe('POST /group/invite', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('Member invites a user to the group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: student2Id })
        .expect(200, { message: 'User invited to group' })
    })
    test('Member invites an interested user to the group and they are added', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await requestJoinGroup(groupId, student2Id)
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: student2Id })
        .expect(200, { message: 'User joined group' })
      await request(app)
        .get('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200)
        .expect((res) => {
          expect(res.body.group.members).toStrictEqual([
            {
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              firstName: 'adam',
              id: studentId,
              lastName: 'chen',
              skills: []
            },
            {
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              firstName: 'adam',
              id: student2Id,
              lastName: 'chen',
              skills: []
            }
          ])
        })
    })
    test('All requests are cleared when group is full', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await requestJoinGroup(groupId, academicId)
      await requestJoinGroup(groupId, student2Id)
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: student2Id })
        .expect(200, { message: 'User joined group' })
      await request(app)
        .get('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200)
        .expect((res) => {
          expect(res.body.group.members).toStrictEqual([
            {
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              firstName: 'adam',
              id: studentId,
              lastName: 'chen',
              skills: []
            },
            {
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              firstName: 'adam',
              id: student2Id,
              lastName: 'chen',
              skills: []
            }
          ])
        })
      await request(app)
        .get('/group/requests')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, { requests: [] })
    })
  })
  describe('error', () => {
    test('Member cannot invite a member to the group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: studentId })
        .expect(400, { error: 'User already in group' })
    })
    test('Group is has no space for new members', async () => {
      let lonerGroupId = await createGroupWithFields(studentId, {
        name: 'Just Me',
        description: 'I am alone',
        size: 1
      })
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: lonerGroupId, uId: student2Id })
        .expect(400, { error: 'No more space for new members' })
    })
    test('User is already invited', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: student2Id })
        .expect(200, { message: 'User invited to group' })
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: student2Id })
        .expect(400, { error: 'User already invited to group' })
    })
    test('Invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: invalidId })
        .expect(400, { error: 'User not found' })
    })
  })
})

describe('DELETE /group/uninvite', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('Member uninvites a user from the group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: student2Id })
        .expect(200, { message: 'User invited to group' })
      await request(app)
        .delete('/group/uninvite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId, uId: student2Id })
        .expect(200, { message: 'User uninvited from group' })
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: student2Id })
        .expect(200, { message: 'User invited to group' })
    })
  })
  describe('error', () => {
    test('User not invited to group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/group/uninvite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId, uId: student2Id })
        .expect(400, { error: 'User not invited to group' })
    })
    test('Invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/group/uninvite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId, uId: invalidId })
        .expect(400, { error: 'User not invited to group' })
    })
  })
})

describe('DELETE /group/request/reject', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('Member rejects a request to join the group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await requestJoinGroup(groupId, student2Id)
      await request(app)
        .delete('/group/request/reject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId, uId: student2Id })
        .expect(200, { message: 'User request rejected' })
    })
  })
  describe('error', () => {
    test('User not requested to join group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/group/request/reject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId, uId: student2Id })
        .expect(400, { error: 'User not requested to join group' })
    })
    test('Invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/group/request/reject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId, uId: invalidId })
        .expect(400, { error: 'User not requested to join group' })
    })
    test('Invalid gId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/group/request/reject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: invalidId, uId: student2Id })
        .expect(400, { error: 'Group not found' })
    })
  })
})

describe('GET /group/invites', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('No invites to the group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/invites')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, { invites: [] })
    })
    test('Two invites to the group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: student2Id })
        .expect(200, { message: 'User invited to group' })
      await request(app)
        .post('/group/invite')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ gId: groupId, uId: student3Id })
        .expect(200, { message: 'User invited to group' })
      await request(app)
        .get('/group/invites')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, {
          invites: [
            {
              id: student2Id,
              firstName: 'adam',
              lastName: 'chen',
              email: 'adam@student2.com',
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              skills: []
            },
            {
              id: student3Id,
              firstName: 'adam',
              lastName: 'chen',
              email: 'adam@student3.com',
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              skills: []
            }
          ]
        })
    })
  })
})

describe('GET /group/requests', () => {
  let groupId: string
  beforeEach(async () => {
    groupId = await createGroup('Progchamps', studentId)
  })
  describe('success', () => {
    test('No requests to the group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/requests')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, { requests: [] })
    })
    test('Two requests to the group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await requestJoinGroup(groupId, student2Id)
      await requestJoinGroup(groupId, student3Id)
      await request(app)
        .get('/group/requests')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, {
          requests: [
            {
              id: student2Id,
              firstName: 'adam',
              lastName: 'chen',
              email: 'adam@student2.com',
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              skills: []
            },
            {
              id: student3Id,
              firstName: 'adam',
              lastName: 'chen',
              email: 'adam@student3.com',
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              skills: []
            }
          ]
        })
    })
  })
})

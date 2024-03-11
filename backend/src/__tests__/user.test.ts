import { afterAll, beforeEach, test, describe, expect, vi } from 'vitest'
import request from 'supertest'
import { app } from '../index.js'
import { UserType } from '@prisma/client'
import {
  login,
  register,
  togglevisibility,
  joinGroup,
  inviteUserToGroup,
  requestJoinGroup,
  createGroup,
  createProjectShort,
  createCourse
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
  academicId = await register(
    'academic',
    'smith',
    'academic@staff.com',
    'Password123?',
    UserType.ACADEMIC
  )
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
    'ethan',
    'fong',
    'ethan@student.com',
    'Password123?',
    UserType.STUDENT
  )
  await togglevisibility(studentId)
  await togglevisibility(student2Id)
  await togglevisibility(adminId)
  await togglevisibility(academicId)
  invalidId = studentId + student2Id + adminId + 'invalid'
})

const adamChenProfile = {
  firstName: 'adam',
  lastName: 'chen',
  email: 'adam@student.com',
  phoneNumber: null,
  school: null,
  degree: null,
  avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
  workExperience: [],
  courses: [],
  ownedProjects: [],
  groups: [],
  type: UserType.STUDENT,
  public: false
}

afterAll(async () => {
  await prisma.user.deleteMany()
  await prisma.sharedProfile.deleteMany()
})

describe('GET /user', () => {
  describe('success', () => {
    test('User gets their own profile', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, adamChenProfile)
    })
    test("Admin gets another user's profile", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, adamChenProfile)
    })
  })
  describe('error', () => {
    test("Non-admin cannot get another user's profile", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: adminId })
        .expect(403, { error: 'Forbidden: User has not shared profile' })
    })
    test('Missing uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'Missing uId' })
    })
    test('Invalid uId', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: invalidId })
        .expect(400, { error: 'User profile not found' })
    })
  })
})

describe('PUT /user/setname', () => {
  describe('success', () => {
    test('User sets their own name', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setname')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          firstName: 'chadam',
          lastName: 'tren'
        })
        .expect(200, { message: 'Name updated' })
    })
    test("Admin sets another user's name", async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/setname')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, firstName: 'chadam', lastName: 'tren' })
        .expect(200, { message: 'Name updated' })
    })
  })
  describe('error', () => {
    test("Non-admin cannot set another user's name", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setname')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: adminId,
          firstName: 'chadam',
          lastName: 'tren'
        })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Missing uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setname')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          firstName: 'chadam',
          lastName: 'tren'
        })
        .expect(400, { error: 'Missing user id' })
    })
    test('Missing firstName', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setname')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          lastName: 'tren'
        })
        .expect(400, { error: 'Missing first name or last name' })
    })
    test('Missing lastName', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setname')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          firstName: 'chadam'
        })
        .expect(400, { error: 'Missing first name or last name' })
    })
    test('Invalid uId', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/setname')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: invalidId,
          firstName: 'chadam',
          lastName: 'tren'
        })
        .expect(400, { error: 'User not found' })
    })
  })
})

describe('PUT /user/setemail', () => {
  describe('succcess', () => {
    test('User sets their own email', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setemail')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, email: 'adam@ad.unsw.edu.au' })
        .expect(200, { message: 'Email updated' })
    })
    test("Admin sets another user's email", async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/setemail')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, email: 'adam@ad.unsw.edu.au' })
        .expect(200, { message: 'Email updated' })
    })
  })
  describe('error', () => {
    test("Non-admin cannot set another user's email", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setemail')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: adminId, email: 'admin@staff.unsw.edu.au' })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Missing uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setemail')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ email: 'adam@ad.unsw.edu.au' })
        .expect(400, { error: 'Missing user id' })
    })
    test('Missing email', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setemail')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId })
        .expect(400, { error: 'Missing email' })
    })
    test('Invalid email format', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setemail')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, email: 'weirdemail.com' })
        .expect(400, { error: 'Email does not follow required format' })
    })
    test('Invalid uId', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/setemail')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: '123', email: 'adam@ad.unsw.edu.au' })
        .expect(400, { error: 'User not found' })
    })
  })
})

describe('PUT /user/setpassword', () => {
  describe('success', () => {
    test('User sets their own password', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setpassword')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, password: 'Password1234?' })
        .expect(200, { message: 'Password updated' })
      await login('adam@student.com', 'Password1234?')
    })
    test("Admin sets another user's password", async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/setpassword')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, password: 'Password1234?' })
        .expect(200, { message: 'Password updated' })
      await login('adam@student.com', 'Password1234?')
    })
  })
  describe('error', () => {
    test("Non-admin cannot set another user's password", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setpassword')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: adminId, password: 'Password1234?' })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Missing uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setpassword')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ password: 'Password1234?' })
        .expect(400, { error: 'Missing user id' })
    })
    test('Missing password', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setpassword')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId })
        .expect(400, { error: 'Missing password' })
    })
    test('New password does not meet password conditions', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setpassword')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, password: 'pass' })
        .expect(400, {
          error:
            'Password does not satisfy conditions. ' +
            'Ensure password has minimum six characters, ' +
            'at least one uppercase letter, ' +
            'one lowercase letter, one number and one special character'
        })
      test('Invalid uId', async () => {
        var res = await request(app)
          .post('/auth/login')
          .send({
            email: 'admin@staff.com',
            password: 'Password123?'
          })
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('uId')
            expect(typeof res.body.uId).toBe('string')
          })
        await request(app)
          .put('/user/setpassword')
          .set('Cookie', res.headers['set-cookie'] || null)
          .send({ uId: invalidId, password: 'Password1234?' })
          .expect(400, { error: 'User not found' })
      })
    })
  })
})

describe('PUT /user/setphone', () => {
  describe('success', () => {
    test('User sets their own phone number', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setphone')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, phoneNumber: '0412345678' })
        .expect(200, { message: 'Phone number updated' })
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          ...adamChenProfile,
          phoneNumber: '0412345678'
        })
    })
    test("Admin sets another user's phone number", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setphone')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, phoneNumber: '0412345678' })
        .expect(200, { message: 'Phone number updated' })
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          ...adamChenProfile,
          phoneNumber: '0412345678'
        })
    })
  })
  describe('error', () => {
    test("Non-admin cannot set another user's phone number", async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .put('/user/setphone')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, phoneNumber: '0412345678' })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Invalid phone number', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setphone')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, phoneNumber: '123' })
        .expect(400, { error: 'Invalid phone number' })
    })
    test('Missing phone number', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setphone')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId })
        .expect(400, { error: 'Missing phone number' })
    })
  })
})

describe('PUT /user/setschool', () => {
  describe('success', () => {
    test('User sets their own school', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setschool')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          school: 'The Univeristy of New South Wales'
        })
        .expect(200, { message: 'School updated' })
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          ...adamChenProfile,
          school: 'The Univeristy of New South Wales'
        })
    })
    test("Admin sets another user's school", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setschool')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          school: 'The Univeristy of New South Wales'
        })
        .expect(200, { message: 'School updated' })
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          ...adamChenProfile,
          school: 'The Univeristy of New South Wales'
        })
    })
    test('User removes their school', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setschool')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          school: 'The Univeristy of New South Wales'
        })
        .expect(200, { message: 'School updated' })
      await request(app)
        .put('/user/setschool')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, school: '' })
        .expect(200, { message: 'School updated' })
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          ...adamChenProfile,
          school: ''
        })
    })
  })
  describe('error', () => {
    test("Non-admin cannot set another user's school", async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .put('/user/setschool')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          school: 'The Univeristy of New South Wales'
        })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Missing school', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setschool')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId })
        .expect(400, { error: 'Missing school' })
    })
  })
})

describe('PUT /user/setdegree', () => {
  describe('success', () => {
    test('User sets their own degree', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setdegree')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          degree: "Bachelor's of Civil Engineering with Architecture"
        })
        .expect(200, { message: 'Degree updated' })
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          ...adamChenProfile,
          degree: "Bachelor's of Civil Engineering with Architecture"
        })
    })
    test("Admin sets another user's degree", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setdegree')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          degree: "Bachelor's of Civil Engineering with Architecture"
        })
        .expect(200, { message: 'Degree updated' })
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          ...adamChenProfile,
          degree: "Bachelor's of Civil Engineering with Architecture"
        })
    })
    test('User removes their degree', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setdegree')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          degree: "Bachelor's of Civil Engineering with Architecture"
        })
        .expect(200, { message: 'Degree updated' })
      await request(app)
        .put('/user/setdegree')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, degree: '' })
        .expect(200, { message: 'Degree updated' })
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          ...adamChenProfile,
          degree: ''
        })
    })
  })
  describe('error', () => {
    test("Non-admin cannot set another user's degree", async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .put('/user/setdegree')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          degree: "Bachelor's of Civil Engineering with Architecture"
        })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Missing degree', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setdegree')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId })
        .expect(400, { error: 'Missing degree' })
    })
  })
})

describe('PUT /user/setavatar', () => {
  describe('success', () => {
    test('User sets their own avatar', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
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
    test('Admin sets another users avatar', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
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
    test('Missing uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'Missing user id' })
    })
    test('Missing imageUrl', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
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
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
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
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
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
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
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
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
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
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: invalidId,
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
          topLeftX: '0',
          topLeftY: '0',
          width: '1200',
          height: '837'
        })
        .expect(400, { error: 'User not found' })
    })
    test('Invalid imageUrl', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
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
        .put('/user/setavatar')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
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

describe('PUT /user/settype', () => {
  describe('success', () => {
    test('Admin sets another user to admin', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/settype')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, type: UserType.ADMIN })
        .expect(200, { message: 'Type updated' })
    })
    test('Admin sets an academic to a student', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/settype')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: academicId, type: UserType.STUDENT })
        .expect(200, { message: 'Type updated' })
    })
  })
  describe('error', () => {
    test('Invalid type', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/settype')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: academicId, type: 'hello' })
        .expect(400, { error: 'Invalid type' })
    })
    test('Missing type', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/settype')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: academicId })
        .expect(400, { error: 'Missing type' })
    })
    test('Student cannot set user type', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/settype')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, type: UserType.ADMIN })
        .expect(403, { error: 'Forbidden: User does not have authorized role' })
    })
  })
})

describe('POST /user/workexperience', () => {
  describe('success', () => {
    test('Student adds work experience', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
    })
    test('Admin adds work experience to a student', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
    })
  })
  describe('error', () => {
    test('Work experience already exists', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, workExperience: 'Spacebook: 2000-2002' })
        .expect(400, { error: 'Work experience already exists' })
    })
    test('Student cannot add work experience to another student', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, workExperience: 'Spacebook: 2000-2002' })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Missing work experience', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: academicId })
        .expect(400, { error: 'Missing work experience' })
    })
  })
})

describe('PUT /user/workexperience', () => {
  describe('success', () => {
    test('Student edits work experience', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
      await request(app)
        .put('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          oldWorkExperience: 'Spacebook: 2000-2002',
          newWorkExperience: 'Blockflix: 2000-2004'
        })
        .expect(200, { message: 'Work experience updated' })
    })
    test('Admin edits work experience of a student', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
      await request(app)
        .put('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          oldWorkExperience: 'Spacebook: 2000-2002',
          newWorkExperience: 'Blockflix: 2000-2004'
        })
        .expect(200, { message: 'Work experience updated' })
    })
  })
  describe('error', () => {
    test('Student cannot edit work experience of another student', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
      res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: student2Id,
          oldWorkExperience: 'Spacebook: 2000-2002',
          newWorkExperience: 'Blockflix: 2000-2004'
        })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Old work experience not found', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
      await request(app)
        .put('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: student2Id,
          oldWorkExperience: 'Bookspace: 2000-2002',
          newWorkExperience: 'Blockflix: 2000-2004'
        })
        .expect(400, { error: 'Work experience not found' })
    })
    test('Missing work experience', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: academicId })
        .expect(400, { error: 'Missing work experience' })
    })
  })
})

describe('DELETE /user/workexperience', () => {
  describe('success', () => {
    test('Student edits work experience', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
      await request(app)
        .delete('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({
          uId: studentId,
          workExperience: 'Spacebook: 2000-2002'
        })
        .expect(200, { message: 'Work experience updated' })
    })
    test('Admin edits work experience of a student', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
      await request(app)
        .delete('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({
          uId: studentId,
          workExperience: 'Spacebook: 2000-2002'
        })
        .expect(200, { message: 'Work experience updated' })
    })
  })
  describe('error', () => {
    test('Student cannot edit work experience of another student', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
      res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({
          uId: student2Id,
          workExperience: 'Spacebook: 2000-2002'
        })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Work experience not found', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, workExperience: 'Spacebook: 2000-2002' })
        .expect(200, { message: 'Work experience updated' })
      await request(app)
        .delete('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({
          uId: student2Id,
          workExperience: 'Bookspace: 2000-2002'
        })
        .expect(400, { error: 'Work experience not found' })
    })
    test('Missing work experience', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .delete('/user/workexperience')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: academicId })
        .expect(400, { error: 'Missing work experience' })
    })
  })
})

describe('DELETE /user', () => {
  describe('success', () => {
    test('User deletes their own account', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, { message: 'User deleted' })
      await request(app)
        .post('/auth/login')
        .send({
          email: 'adam@student.com',
          password: 'Password123?'
        })
        .expect(400, { error: 'User not found' })
    })
    test("Admin deletes another user's account", async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .delete('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, { message: 'User deleted' })
      await request(app)
        .post('/auth/login')
        .send({
          email: 'adam@student.com',
          password: 'Password123?'
        })
        .expect(400, { error: 'User not found' })
    })
    test('User deletes their own account and has a group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await createGroup('progchamps', studentId)
      await request(app)
        .delete('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, { message: 'User deleted' })
      await request(app)
        .post('/auth/login')
        .send({
          email: 'adam@student.com',
          password: 'Password123?'
        })
        .expect(400, { error: 'User not found' })
    })
    test('User deletes their own account and is invited to a group', async () => {
      const groupId = await createGroup('progchamps', studentId)
      await inviteUserToGroup(groupId, student2Id)
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .delete('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id })
        .expect(200, { message: 'User deleted' })
      await request(app)
        .post('/auth/login')
        .send({
          email: 'ethan@student.com',
          password: 'Password123?'
        })
        .expect(400, { error: 'User not found' })
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/invites')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, { invites: [] })
    })
    test('User deletes their own account and has a project', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      const projectId = await createProjectShort('CISAP', academicId, 'CISAP')
      await request(app)
        .delete('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: academicId })
        .expect(200, { message: 'User deleted' })
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/projects/all')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          projects: [
            {
              id: projectId,
              title: 'CISAP',
              description: 'CISAP',
              topics: ['test topic'],
              scope: 'This is the scope of the project',
              requiredSkills: ['NLP', 'Agile', 'Web Development', 'UI/UX'],
              outcomes: ['Documentation', 'Testing', 'Web Application'],
              maxGroupSize: null,
              minGroupSize: null,
              maxGroupCount: null,
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-project.jpg'
            }
          ]
        })
    })
    test('User deletes their own account and has a course', async () => {
      var res = await login('academic@staff.com', 'Password123?')
      const courseId = await createCourse('COMP1234', '2021', academicId)
      await request(app)
        .delete('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: academicId })
        .expect(200, { message: 'User deleted' })
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/courses/all')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, {
          courses: [
            {
              id: courseId,
              code: 'COMP1234',
              year: '2021',
              title: 'title',
              summary: 'summary'
            }
          ]
        })
    })
  })
  describe('error', () => {
    test("Non-admin cannot delete another user's account", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .delete('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: adminId })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Invalid uId', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .delete('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: invalidId })
        .expect(400, { error: 'User not found' })
    })
  })
})

describe('GET /user/all', () => {
  describe('success', () => {
    test('Admin gets all users', async () => {
      const expected = [
        {
          id: academicId,
          courses: [],
          email: 'academic@staff.com',
          phoneNumber: null,
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'academic',
          lastName: 'smith',
          groups: [],
          ownedProjects: [],
          workExperience: [],
          type: UserType.ACADEMIC,
          public: false
        },
        {
          id: studentId,
          courses: [],
          email: 'adam@student.com',
          phoneNumber: null,
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'adam',
          lastName: 'chen',
          groups: [],
          ownedProjects: [],
          workExperience: [],
          type: UserType.STUDENT,
          public: false
        },
        {
          id: adminId,
          courses: [],
          email: 'admin@staff.com',
          phoneNumber: null,
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'admin',
          lastName: 'fong',
          groups: [],
          ownedProjects: [],
          workExperience: [],
          type: UserType.ADMIN,
          public: false
        },
        {
          id: student2Id,
          courses: [],
          email: 'ethan@student.com',
          phoneNumber: null,
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'ethan',
          lastName: 'fong',
          groups: [],
          ownedProjects: [],
          workExperience: [],
          type: UserType.STUDENT,
          public: false
        }
      ].sort()

      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/users/all')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200)
        .then((res) => {
          expect(res.body.users.length).toBe(expected.length)
          expect(new Set(res.body.users)).toStrictEqual(new Set(expected))
        })
    })
  })
  describe('error', () => {
    test('Non-admin cannot get all users', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/users/all')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, { error: 'Forbidden: User does not have authorized role' })
    })
  })
})

describe('GET /users/all/visible', () => {
  describe('success', () => {
    test('Student gets all visible but all users are private', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/users/all/visible')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, { users: [] })
    })
    test('Student gets all visible but all users are public', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await togglevisibility(adminId)
      await togglevisibility(academicId)
      await togglevisibility(student2Id)
      await request(app)
        .get('/users/all/visible')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          users: [
            {
              id: academicId,
              courses: [],
              email: 'academic@staff.com',
              phoneNumber: null,
              school: null,
              degree: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              firstName: 'academic',
              lastName: 'smith',
              groups: [],
              ownedProjects: [],
              workExperience: [],
              type: UserType.ACADEMIC
            },
            {
              id: adminId,
              courses: [],
              email: 'admin@staff.com',
              phoneNumber: null,
              school: null,
              degree: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              firstName: 'admin',
              lastName: 'fong',
              groups: [],
              ownedProjects: [],
              workExperience: [],
              type: UserType.ADMIN
            },
            {
              id: student2Id,
              courses: [],
              email: 'ethan@student.com',
              phoneNumber: null,
              school: null,
              degree: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              firstName: 'ethan',
              lastName: 'fong',
              groups: [],
              ownedProjects: [],
              workExperience: [],
              type: UserType.STUDENT
            }
          ]
        })
    })
    test('Student gets all visible and some users are private and shared', async () => {
      await togglevisibility(adminId)
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, shareToId: studentId })
        .expect(200, { message: 'Shared profile' })
      await request(app)
        .get('/users/all/visible')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, {
          users: [
            {
              id: adminId,
              courses: [],
              email: 'admin@staff.com',
              phoneNumber: null,
              school: null,
              degree: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              firstName: 'admin',
              lastName: 'fong',
              groups: [],
              ownedProjects: [],
              workExperience: [],
              type: UserType.ADMIN
            },
            {
              id: student2Id,
              courses: [],
              email: 'ethan@student.com',
              phoneNumber: null,
              school: null,
              degree: null,
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              firstName: 'ethan',
              lastName: 'fong',
              groups: [],
              ownedProjects: [],
              workExperience: [],
              type: UserType.STUDENT
            }
          ]
        })
    })
  })
})

describe('GET /users/all/public', () => {
  let expected: { users }
  beforeEach(() => {
    expected = {
      users: [
        {
          id: academicId,
          courses: [],
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'academic',
          lastName: 'smith'
        },
        {
          id: adminId,
          courses: [],
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'admin',
          lastName: 'fong'
        },
        {
          id: studentId,
          courses: [],
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'adam',
          lastName: 'chen'
        },
        {
          id: student2Id,
          courses: [],
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'ethan',
          lastName: 'fong'
        }
      ]
    }
  })
  describe('success', () => {
    test('Student gets all public users', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/users/all/public')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, expected)
    })
    test('Admin gets all public users', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/users/all/public')
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, expected)
    })
  })
  describe('error', () => {
    test('Cannot get all users while not logged in', async () => {
      await request(app).get('/users/all/public').expect(401)
    })
  })
})

describe('PUT /user/shareprofile', () => {
  describe('success', () => {
    test('Student shares profile with another student', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, shareToId: student2Id })
        .expect(200, { message: 'Shared profile' })
      res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, adamChenProfile)
    })
    test('Admin shares a student profile with another student', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, shareToId: student2Id })
        .expect(200, { message: 'Shared profile' })
      res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, adamChenProfile)
    })
  })
  describe('error', () => {
    test("Student cannot share another student's profile", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, shareToId: studentId })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('shareToId is invalid', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, shareToId: invalidId })
        .expect(400, { error: 'User not found' })
    })
    test('uId is invalid', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: invalidId, shareToId: studentId })
        .expect(400, { error: 'User not found' })
    })
  })
})

describe('PUT /user/unshareprofile', () => {
  describe('success', () => {
    test('Student shares a profile, and then unshares', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, shareToId: student2Id })
        .expect(200, { message: 'Shared profile' })
      await request(app)
        .put('/user/unshareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, unshareToId: student2Id })
        .expect(200, { message: 'Unshared profile' })
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(403, { error: 'Forbidden: User has not shared profile' })
    })
    test('Admin shares a profile, and then unshares', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, shareToId: student2Id })
        .expect(200, { message: 'Shared profile' })
      await request(app)
        .put('/user/unshareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, unshareToId: student2Id })
        .expect(200, { message: 'Unshared profile' })
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(403, { error: 'Forbidden: User has not shared profile' })
    })
  })
  describe('error', () => {
    test('Student unshares profile that was not shared in the first place', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/unshareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, unshareToId: student2Id })
        .expect(400, { error: 'Profile not shared to this user' })
    })
    test('Invalid uId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/unshareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: invalidId, unshareToId: student2Id })
        .expect(400, { error: 'User not found' })
    })
    test('Invalid unshareToId', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/unshareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, unshareToId: invalidId })
        .expect(400, { error: 'Profile not shared to this user' })
    })
  })
})

describe('PUT /user/unshareall', () => {
  describe('success', () => {
    test('Student shares a profile, and then unshares all profiles', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, shareToId: student2Id })
        .expect(200, { message: 'Shared profile' })
      await request(app)
        .put('/user/unshareall')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId })
        .expect(200, { message: 'Unshared profile from all users' })
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(403, { error: 'Forbidden: User has not shared profile' })
    })
    test('Admin shares a profile, and then unshares all profiles', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/shareprofile')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, shareToId: student2Id })
        .expect(200, { message: 'Shared profile' })
      await request(app)
        .put('/user/unshareall')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId })
        .expect(200, { message: 'Unshared profile from all users' })
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/user')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(403, { error: 'Forbidden: User has not shared profile' })
    })
    test('Student with no shared profiles, unshares all profiles', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/unshareall')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId })
        .expect(200, { message: 'Unshared profile from all users' })
    })
  })
})

describe('GET /users/shared', () => {
  let expected: { users }
  beforeEach(async () => {
    var res = await login('admin@staff.com', 'Password123?')
    await request(app)
      .put('/user/shareprofile')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({ uId: student2Id, shareToId: studentId })
      .expect(200, { message: 'Shared profile' })
    await request(app)
      .put('/user/shareprofile')
      .set('Cookie', res.headers['set-cookie'] || null)
      .send({ uId: adminId, shareToId: studentId })
      .expect(200, { message: 'Shared profile' })
    expected = {
      users: [
        {
          id: student2Id,
          courses: [],
          email: 'ethan@student.com',
          phoneNumber: null,
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'ethan',
          lastName: 'fong',
          groups: [],
          ownedProjects: [],
          workExperience: [],
          type: UserType.STUDENT
        },
        {
          id: adminId,
          courses: [],
          email: 'admin@staff.com',
          phoneNumber: null,
          school: null,
          degree: null,
          avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
          firstName: 'admin',
          lastName: 'fong',
          groups: [],
          ownedProjects: [],
          workExperience: [],
          type: UserType.ADMIN
        }
      ]
    }
  })
  describe('success', () => {
    test('Student gets all users that shared their profile to them', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/users/shared')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, expected)
    })
    test('Admin gets all users that shared their profile to student', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/users/shared')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(200, expected)
    })
    test('Admin gets all users that shared their profile to them', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/users/shared')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: adminId })
        .expect(200, { users: [] })
    })
  })
  describe('error', () => {
    test('Student cannot get all users that shared their profile to another student', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/users/shared')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: studentId })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
  })
})

describe('PUT /user/setdetails', () => {
  describe('success', () => {
    test('User sets their own details', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setdetails')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          phoneNumber: '0444444444',
          school: 'UNSW',
          degree: 'Bachelors of Computer Science'
        })
        .expect(200, { message: 'User updated' })
    })
    test("Admin sets another user's details", async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/setdetails')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          phoneNumber: '0444444444',
          school: 'UNSW',
          degree: 'Bachelors of Computer Science'
        })
        .expect(200, { message: 'User updated' })
    })
  })
  describe('error', () => {
    test("Non-admin cannot set another user's details", async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setdetails')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: adminId,
          phoneNumber: '0444444444',
          school: 'UNSW',
          degree: 'Bachelors of Computer Science'
        })
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
    test('Missing fields', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/setdetails')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: studentId,
          school: 'UNSW',
          degree: 'Bachelors of Computer Science'
        })
        .expect(400, { error: 'Missing fields' })
    })
    test('Invalid uId', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/setdetails')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({
          uId: invalidId,
          phoneNumber: '0444444444',
          school: 'UNSW',
          degree: 'Bachelors of Computer Science'
        })
        .expect(400, { error: 'User not found' })
    })
  })
})

describe('GET /user/ispublic', () => {
  describe('success', () => {
    test('User is able to get ispublic', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { isPublic: false })
    })
    test('User is able to get ispublic', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { isPublic: false })
    })
    test('User is able to get ispublic', async () => {
      await togglevisibility(studentId)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { isPublic: true })
    })
  })
  describe('error', () => {
    test('Invalid uId', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, {
          error: 'User not found'
        })
    })
    test('Student cannot toggle visibility of another user', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: student2Id })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
  })
})

describe('PUT /user/togglevisibility', () => {
  describe('success', () => {
    test('User is able to toggle visibility', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'User visibility updated', isPublic: true })
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'User visibility updated', isPublic: false })
    })
    test('User is able to toggle visibility', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'User visibility updated', isPublic: true })
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'User visibility updated', isPublic: false })
    })
  })
  describe('error', () => {
    test('Invalid uId', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'User not found' })
    })
    test('Student cannot toggle visibility of another user', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: student2Id })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
  })
})

describe('GET /user/ispublic', () => {
  describe('success', () => {
    test('User is able to get ispublic', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { isPublic: false })
    })
    test('User is able to get ispublic', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { isPublic: false })
    })
    test('User is able to get ispublic', async () => {
      await togglevisibility(studentId)
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { isPublic: true })
    })
  })
  describe('error', () => {
    test('Invalid uId', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, {
          error: 'User not found'
        })
    })
    test('Student cannot toggle visibility of another user', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/user/ispublic')
        .query({ uId: student2Id })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
  })
})

describe('PUT /user/togglevisibility', () => {
  describe('success', () => {
    test('User is able to toggle visibility', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'User visibility updated', isPublic: true })
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'User visibility updated', isPublic: false })
    })
    test('User is able to toggle visibility', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'User visibility updated', isPublic: true })
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: studentId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(200, { message: 'User visibility updated', isPublic: false })
    })
  })
  describe('error', () => {
    test('Invalid uId', async () => {
      var res = await login('admin@staff.com', 'Password123?')
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: invalidId })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(400, { error: 'User not found' })
    })
    test('Student cannot toggle visibility of another user', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .put('/user/togglevisibility')
        .send({ uId: student2Id })
        .set('Cookie', res.headers['set-cookie'] || null)
        .expect(403, {
          error: 'Forbidden: User id does not match authorized user'
        })
    })
  })
})

describe('POST /user/invite/accept', () => {
  let groupId: string, student3Id: string
  beforeEach(async () => {
    await prisma.group.deleteMany()
    student3Id = await register(
      'derek',
      'tran',
      'derek@student.com',
      'Password123?',
      UserType.STUDENT
    )
    await togglevisibility(student3Id)
    groupId = await createGroup('progchamps', studentId)
  })
  describe('success', () => {
    test('User accepts invite', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await inviteUserToGroup(groupId, student2Id)
      await request(app)
        .post('/user/invite/accept')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Invite accepted' })
      await request(app)
        .get('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200)
        .expect((res) => {
          expect(res.body.group.members).toStrictEqual([
            {
              id: studentId,
              firstName: 'adam',
              lastName: 'chen',
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              skills: []
            },
            {
              id: student2Id,
              firstName: 'ethan',
              lastName: 'fong',
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              skills: []
            }
          ])
        })
    })
    test('All requests are cleared when group is full', async () => {
      await requestJoinGroup(groupId, student3Id)
      await inviteUserToGroup(groupId, student2Id)
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/invite/accept')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Invite accepted' })
      await request(app)
        .get('/group/requests')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, {
          requests: []
        })
    })
  })
  describe('error', () => {
    test('Invalid gId', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await inviteUserToGroup(groupId, student2Id)
      await request(app)
        .post('/user/invite/accept')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: invalidId })
        .expect(400, { error: 'Group not found' })
    })
    test('User not invited', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/invite/accept')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(400, { error: 'User not invited to group' })
    })
  })
})

describe('DELETE /user/invite/reject', () => {
  let groupId: string
  beforeEach(async () => {
    await prisma.group.deleteMany()
    groupId = await createGroup('progchamps', studentId)
  })
  describe('success', () => {
    test('User rejects invite', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await inviteUserToGroup(groupId, student2Id)
      await request(app)
        .delete('/user/invite/reject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'Invite rejected' })
      await request(app)
        .post('/user/invite/accept')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(400, { error: 'User not invited to group' })
    })
  })
  describe('error', () => {
    test('Invalid gId', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await inviteUserToGroup(groupId, student2Id)
      await request(app)
        .delete('/user/invite/reject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id, gId: invalidId })
        .expect(400, { error: 'Group not found' })
    })
    test('User not invited', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .delete('/user/invite/reject')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id, gId: groupId })
        .expect(400, { error: 'User not invited to group' })
    })
  })
})

describe('POST /user/request', () => {
  let groupId: string, student3Id: string
  beforeEach(async () => {
    await prisma.group.deleteMany()
    student3Id = await register(
      'derek',
      'tran',
      'derek@student.com',
      'Password123?',
      UserType.STUDENT
    )
    await togglevisibility(student3Id)
    groupId = await createGroup('progchamps', studentId)
  })
  describe('success', () => {
    test('User requests to join group', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'User requested to join group' })
    })
    test('User requests while invited', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await inviteUserToGroup(groupId, student2Id)
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'User joined group' })
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200)
        .expect((res) => {
          expect(res.body.group.members).toStrictEqual([
            {
              id: studentId,
              firstName: 'adam',
              lastName: 'chen',
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              skills: []
            },
            {
              id: student2Id,
              firstName: 'ethan',
              lastName: 'fong',
              avatar: 'http://127.0.0.1:3000/imgurl/default.jpg',
              skills: []
            }
          ])
        })
    })
    test('All requests are cleared when group is full', async () => {
      var res = await login('derek@student.com', 'Password123?')
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student3Id, gId: groupId })
        .expect(200, { message: 'User requested to join group' })
      var res = await login('adam@student.com', 'Password123?')
      var res = await login('ethan@student.com', 'Password123?')
      await inviteUserToGroup(groupId, student2Id)
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'User joined group' })
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .get('/group/requests')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ gId: groupId })
        .expect(200, {
          requests: []
        })
    })
  })
  describe('error', () => {
    test('Group is full', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await joinGroup(groupId, academicId)
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(400, { error: 'Group is full' })
    })
    test('Request already exists', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'User requested to join group' })
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(400, { error: 'User already requested to join group' })
    })
    test('Invalid uId', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: invalidId, gId: groupId })
        .expect(400, { error: 'User not found' })
    })
    test('User is already in the group', async () => {
      var res = await login('adam@student.com', 'Password123?')
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: studentId, gId: groupId })
        .expect(400, { error: 'User already in group' })
    })
  })
})

describe('DELETE /user/unrequest', () => {
  let groupId: string
  beforeEach(async () => {
    await prisma.group.deleteMany()
    groupId = await createGroup('progchamps', studentId)
  })
  describe('success', () => {
    test('User requests to join group and then unrequests', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'User requested to join group' })
      await request(app)
        .delete('/user/unrequest')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'User cancelled request to join group' })
    })
  })
  describe('error', () => {
    test('User unrequests without requesting', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .delete('/user/unrequest')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id, gId: groupId })
        .expect(400, { error: 'User has not requested to join group' })
    })
    test('Invalid uId', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: invalidId, gId: groupId })
        .expect(400, { error: 'User not found' })
    })
  })
})

describe('GET /user/requests', () => {
  let groupId: string, group2Id: string, student3Id
  beforeEach(async () => {
    await prisma.group.deleteMany()
    student3Id = await register(
      'bethan',
      'bong',
      'bethan@student.com',
      'Password123?',
      UserType.STUDENT
    )
    groupId = await createGroup('progchamps', studentId)
    group2Id = await createGroup('dogchamps', student3Id)
  })
  describe('success', () => {
    test('User requests to join a group', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'User requested to join group' })
      await request(app)
        .get('/user/requests')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id })
        .expect(200, {
          requests: [
            {
              id: groupId,
              name: 'progchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              description: 'We love scrumming',
              size: 2,
              projectId: null
            }
          ]
        })
    })
    test('User requests to join multiple groups', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: groupId })
        .expect(200, { message: 'User requested to join group' })
      await request(app)
        .post('/user/request')
        .set('Cookie', res.headers['set-cookie'] || null)
        .send({ uId: student2Id, gId: group2Id })
        .expect(200, { message: 'User requested to join group' })
      await request(app)
        .get('/user/requests')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id })
        .expect(200, {
          requests: [
            {
              id: groupId,
              name: 'progchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              description: 'We love scrumming',
              size: 2,
              projectId: null
            },
            {
              id: group2Id,
              name: 'dogchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              description: 'We love scrumming',
              size: 2,
              projectId: null
            }
          ]
        })
    })
  })
})

describe('GET /user/invites', () => {
  let groupId: string, group2Id: string, student3Id
  beforeEach(async () => {
    await prisma.group.deleteMany()
    student3Id = await register(
      'bethan',
      'bong',
      'bethan@student.com',
      'Password123?',
      UserType.STUDENT
    )
    groupId = await createGroup('progchamps', studentId)
    group2Id = await createGroup('dogchamps', student3Id)
  })
  describe('success', () => {
    test('User is invited to join no groups', async () => {
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/user/invites')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id })
        .expect(200, {
          invites: []
        })
    })
    test('User is invited to join a group', async () => {
      await inviteUserToGroup(groupId, student2Id)
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/user/invites')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id })
        .expect(200, {
          invites: [
            {
              id: groupId,
              name: 'progchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              description: 'We love scrumming',
              size: 2,
              projectId: null
            }
          ]
        })
    })
    test('User is invited to join multiple groups', async () => {
      await inviteUserToGroup(groupId, student2Id)
      await inviteUserToGroup(group2Id, student2Id)
      var res = await login('ethan@student.com', 'Password123?')
      await request(app)
        .get('/user/invites')
        .set('Cookie', res.headers['set-cookie'] || null)
        .query({ uId: student2Id })
        .expect(200, {
          invites: [
            {
              id: groupId,
              name: 'progchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              description: 'We love scrumming',
              size: 2,
              projectId: null
            },
            {
              id: group2Id,
              name: 'dogchamps',
              coverPhoto: 'http://127.0.0.1:3000/imgurl/default-group.jpg',
              description: 'We love scrumming',
              size: 2,
              projectId: null
            }
          ]
        })
    })
  })
})

describe('PUT /user/shareprofile/multi', () => {
  test('User shares profile to multiple users', async () => {
    var res = await login('adam@student.com', 'Password123?')
    await request(app)
      .put('/user/shareprofile/multi')
      .send({
        uId: studentId,
        emails: ['ethan@student.com', 'academic@staff.com']
      })
      .set('Cookie', res.headers['set-cookie'] || null)
      .expect(200, { message: 'Shared profile to multiple users' })
    await request(app)
      .get('/users/sharedto')
      .query({ uId: studentId })
      .set('Cookie', res.headers['set-cookie'] || null)
      .expect(200, {
        users: [
          {
            email: 'ethan@student.com',
            id: student2Id
          },
          {
            email: 'academic@staff.com',
            id: academicId
          }
        ]
      })
  })
  test('User shares profile to multiple users, and email that does not exist', async () => {
    var res = await login('adam@student.com', 'Password123?')
    await request(app)
      .put('/user/shareprofile/multi')
      .send({
        uId: studentId,
        emails: [
          'ethan@student.com',
          'academic@staff.com',
          'invalid@something.com'
        ]
      })
      .set('Cookie', res.headers['set-cookie'] || null)
      .expect(200, { message: 'Shared profile to multiple users' })
    await request(app)
      .get('/users/sharedto')
      .query({ uId: studentId })
      .set('Cookie', res.headers['set-cookie'] || null)
      .expect(200, {
        users: [
          {
            email: 'ethan@student.com',
            id: student2Id
          },
          {
            email: 'academic@staff.com',
            id: academicId
          }
        ]
      })
  })
  test('User shares profile to multiple users, and email that does not exist', async () => {
    var res = await login('adam@student.com', 'Password123?')
    await request(app)
      .put('/user/shareprofile/multi')
      .send({
        uId: studentId,
        emails: ['ethan@student.com', 'academic@staff.com', 'ethan@student.com']
      })
      .set('Cookie', res.headers['set-cookie'] || null)
      .expect(200, { message: 'Shared profile to multiple users' })
    await request(app)
      .get('/users/sharedto')
      .query({ uId: studentId })
      .set('Cookie', res.headers['set-cookie'] || null)
      .expect(200, {
        users: [
          {
            email: 'ethan@student.com',
            id: student2Id
          },
          {
            email: 'academic@staff.com',
            id: academicId
          }
        ]
      })
  })
})

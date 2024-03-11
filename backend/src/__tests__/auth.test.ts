import {
  afterAll,
  beforeEach,
  test,
  describe,
  expect,
  beforeAll,
  vi
} from 'vitest'
globalThis.jest = vi
import request from 'supertest'
import { app } from '../index.js'
import prisma from '../../libs/__mocks__/prisma.ts'
import {
  register,
  getEmailVerificationToken,
  getPasswordResetToken,
  login
} from './test-utils.ts'
import { UserType } from '@prisma/client'

vi.mock('../../libs/prisma.ts')

beforeEach(async () => {
  prisma.user.deleteMany()
  prisma.unverifiedUser.deleteMany()
})

beforeAll(async () => {
  prisma.user.deleteMany()
  prisma.unverifiedUser.deleteMany()
})

describe('POST /auth/register/v2', () => {
  describe('success', () => {
    test('User registers with valid fields', () => {
      return request(app)
        .post('/auth/register/v2')
        .send({
          firstName: 'adam',
          lastName: 'chen',
          email: 'adam@student.com',
          password: 'Password123?'
        })
        .expect(200, { message: 'Check your email to verify your account' })
    })
  })
  describe('error', () => {
    test('User registers with invalid name', () => {
      return request(app)
        .post('/auth/register/v2')
        .send({
          firstName: 'adam123',
          lastName: 'chen',
          email: 'history1932@gmail.com',
          password: 'Password123?'
        })
        .expect(400, { error: 'Name does not follow required format' })
    })
    test('User registers with invalid email format', async () => {
      await request(app)
        .post('/auth/register/v2')
        .send({
          firstName: 'adam',
          lastName: 'chen',
          email: 'history1932gmail.com',
          password: 'Password123?'
        })
        .expect(400, { error: 'Email does not follow required format' })
      await request(app)
        .post('/auth/register/v2')
        .send({
          firstName: 'adam',
          lastName: 'chen',
          email: 'history1932@gmail',
          password: 'Password123?'
        })
        .expect(400, { error: 'Email does not follow required format' })
    })
    test('User registers with existing unverified email', async () => {
      await request(app)
        .post('/auth/register/v2')
        .send({
          firstName: 'ethan',
          lastName: 'fong',
          email: 'history1932@gmail.com',
          password: 'Password123?'
        })
        .expect(200, { message: 'Check your email to verify your account' })
      await request(app)
        .post('/auth/register/v2')
        .send({
          firstName: 'ethan',
          lastName: 'fong',
          email: 'history1932@gmail.com',
          password: 'Password123?'
        })
        .expect(400, {
          error:
            'User with this email has already been registered but is not yet verified, please check your email for a verification link'
        })
    })
    test('User registers with existing verified email', async () => {
      await register(
        'derek',
        'tran',
        'derek@student.com',
        'Password123?',
        UserType.STUDENT
      )
      await request(app)
        .post('/auth/register/v2')
        .send({
          firstName: 'ethan',
          lastName: 'fong',
          email: 'derek@student.com',
          password: 'Password123?'
        })
        .expect(400, {
          error: 'User with this email has already been registered'
        })
    })
    describe('User registers with invalid password', () => {
      const msg =
        'Password does not satisfy conditions. ' +
        'Ensure password has minimum six characters, at least one uppercase letter, ' +
        'one lowercase letter, one number and one special character'

      test('Password is less than six characters', () => {
        return request(app)
          .post('/auth/register/v2')
          .send({
            firstName: 'adam',
            lastName: 'chen',
            email: 'history1932@gmail.com',
            password: 'Pass1?'
          })
          .expect(400, { error: msg })
      })

      test('Password doesnt contain uppercase letter', () => {
        return request(app)
          .post('/auth/register/v2')
          .send({
            firstName: 'adam',
            lastName: 'chen',
            email: 'history1932@gmail.com',
            password: 'password123?'
          })
          .expect(400, { error: msg })
      })

      test('Password doesnt contain lowercase letter', () => {
        return request(app)
          .post('/auth/register/v2')
          .send({
            firstName: 'adam',
            lastName: 'chen',
            email: 'history1932@gmail.com',
            password: 'PASSWORD123?'
          })
          .expect(400, { error: msg })
      })

      test('Password doesnt contain number', () => {
        return request(app)
          .post('/auth/register/v2')
          .send({
            firstName: 'adam',
            lastName: 'chen',
            email: 'history1932@gmail.com',
            password: 'Password????'
          })
          .expect(400, { error: msg })
      })

      test('Password doesnt contain special character', () => {
        return request(app)
          .post('/auth/register/v2')
          .send({
            firstName: 'adam',
            lastName: 'chen',
            email: 'history1932@gmail.com',
            password: 'Password1234'
          })
          .expect(400, { error: msg })
      })
    })
  })
})

describe('GET /auth/register/verify/:token', () => {
  test('User registers and verifies email', async () => {
    await request(app)
      .post('/auth/register/v2')
      .send({
        firstName: 'ethan',
        lastName: 'fong',
        email: 'history1932@gmail.com',
        password: 'Password123?'
      })
      .expect(200, { message: 'Check your email to verify your account' })
    const token = await getEmailVerificationToken('history1932@gmail.com')
    await request(app)
      .get(`/auth/register/verify/${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('uId')
        expect(typeof res.body.uId).toBe('string')
      })
  })
  test('User attempts to verify email with a malformed token', async () => {
    await request(app)
      .post('/auth/register/v2')
      .send({
        firstName: 'ethan',
        lastName: 'fong',
        email: 'history1932@gmail.com',
        password: 'Password123?'
      })
      .expect(200, { message: 'Check your email to verify your account' })
    const token =
      (await getEmailVerificationToken('history1932@gmail.com')) + '12'
    await request(app)
      .get(`/auth/register/verify/${token}`)
      .expect(401, { error: 'Invalid token' })
  })
})

describe('POST /auth/passwordreset/request', () => {
  test('User requests password reset', async () => {
    await register(
      'derek',
      'tran',
      'derek@student.com',
      'Password123?',
      UserType.STUDENT
    )
    await request(app)
      .post('/auth/passwordreset/request')
      .send({ email: 'derek@student.com' })
      .expect(200, { message: 'Check your email to reset your password' })
  })
  test('Invalid email', async () => {
    await request(app)
      .post('/auth/passwordreset/request')
      .send({ email: 'derek@student.com' })
      .expect(200, { message: 'Check your email to reset your password' })
  })
})

describe('POST /auth/passwordreset/verify/:token', () => {
  describe('success', () => {
    test('User resets password', async () => {
      await register(
        'derek',
        'tran',
        'derek@student.com',
        'Password123?',
        UserType.STUDENT
      )
      await request(app)
        .post('/auth/passwordreset/request')
        .send({ email: 'derek@student.com' })
        .expect(200, { message: 'Check your email to reset your password' })
      const token = await getPasswordResetToken('derek@student.com')
      await request(app)
        .post(`/auth/passwordreset/${token}`)
        .send({ password: 'Password1234?' })
        .expect(200, { message: 'Password reset successfully' })
      await request(app)
        .post('/auth/login')
        .send({
          email: 'derek@student.com',
          password: 'Password1234?'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('uId')
          expect(typeof res.body.uId).toBe('string')
        })
    })
  })
  describe('error', () => {
    test('User attempts to reset password with a malformed token', async () => {
      test('User resets password', async () => {
        await register(
          'derek',
          'tran',
          'derek@student.com',
          'Password123?',
          UserType.STUDENT
        )
        await request(app)
          .post('/auth/passwordreset/request')
          .send({ email: 'derek@student.com' })
          .expect(200, { message: 'Check your email to reset your password' })
        const token = (await getPasswordResetToken('derek@student.com')) + '123'
        await request(app)
          .post(`/auth/passwordreset/${token}`)
          .send({ password: 'Password1234?' })
          .expect(401, { error: 'Unauthorized' })
      })
    })
  })
})

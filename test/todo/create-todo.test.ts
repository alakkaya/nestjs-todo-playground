import { CreateTodoDto } from '../../src/modules/todo/dto';
import { createTestUser, generateTestUserDto } from '../common/user.helper';
import { getAuthTokens } from '../common/auth.helper';
import * as request from 'supertest';
import { testConfig } from '../test-config';
import { ErrorCode } from '../../src/core/error/error-code';
import { TodoMongoModel } from '../../test/common';

describe('Todo - Create', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    const userDto = generateTestUserDto('create_todo');
    const userRes = await createTestUser(userDto);
    userId = userRes.body.result.id;
    const tokens = await getAuthTokens(userDto.nickname, userDto.password);
    accessToken = tokens.accessToken;
  });

  it('should create a todo', async () => {
    const todoDto: CreateTodoDto = {
      title: 'Test Todo',
      description: 'Test Description',
    };
    const res = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(todoDto);
    expect(res.status).toBe(201);
    expect(res.body.result.title).toBe(todoDto.title);
    expect(res.body.result.description).toBe(todoDto.description);
    expect(res.body.result.completed).toBe(false);
    expect(res.body.result.userId).toBe(userId);

    // Verify the todo is saved in the database
    const savedTodo = await TodoMongoModel.findById(res.body.result.id)
      .lean()
      .exec();
    expect(savedTodo).toBeTruthy();
    expect(savedTodo.title).toBe(todoDto.title);
    expect(savedTodo.description).toBe(todoDto.description);
    expect(savedTodo.completed).toBe(false);
    expect(savedTodo.userId.toString()).toBe(userId);
    expect(savedTodo.createdAt).toBeTruthy();
    expect(savedTodo.updatedAt).toBeTruthy();
  });

  it('should return 400 for missing title', async () => {
    const res = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'desc' });
    expect(res.status).toBe(400);
    expect(res.body.meta.errorMessage).toEqual(
      expect.arrayContaining([expect.stringContaining('title')]),
    );

    // Check that it is not saved in the database
    const todoCount = await TodoMongoModel.countDocuments({}).exec();
    expect(todoCount).toBe(0);
  });

  it('should return 401 if no token is provided', async () => {
    const todoDto: CreateTodoDto = {
      title: 'No Auth',
      description: 'No Auth Desc',
    };
    const res = await request(testConfig.baseUri).post('/todo').send(todoDto);
    expect(res.status).toBe(401);
    expect(res.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);

    // Check that it is not saved in the database
    const todoCount = await TodoMongoModel.countDocuments({}).exec();
    expect(todoCount).toBe(0);
  });
});

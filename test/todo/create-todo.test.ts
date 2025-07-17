import { CreateTodoDto } from '../../src/modules/todo/dto';
import {
  createTestUser,
  generateTestUserDto,
  createTestTodo,
  generateTestTodoDto,
} from '../common';
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
    const todoDto = generateTestTodoDto('create');
    const res = await createTestTodo(accessToken, todoDto);

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

  it('should isolate todos between different users', async () => {
    // First user and todo
    const firstTodoDto = generateTestTodoDto('first_user');
    const firstRes = await createTestTodo(accessToken, firstTodoDto);

    // Create second user
    const secondUserDto = generateTestUserDto('second_user');
    const secondUserRes = await createTestUser(secondUserDto);
    const secondUserId = secondUserRes.body.result.id;
    const secondTokens = await getAuthTokens(
      secondUserDto.nickname,
      secondUserDto.password,
    );
    const secondAccessToken = secondTokens.accessToken;

    // Create todo for second user
    const secondTodoDto = generateTestTodoDto('second_user');
    const secondRes = await createTestTodo(secondAccessToken, secondTodoDto);

    // Both todos should be created successfully
    expect(firstRes.status).toBe(201);
    expect(secondRes.status).toBe(201);

    // Verify there are 2 todos in database
    const allTodos = await TodoMongoModel.find({}).lean().exec();
    expect(allTodos.length).toBe(2);

    // Verify todos belong to different users
    const firstUserTodos = allTodos.filter(
      (todo) => todo.userId.toString() === userId,
    );
    const secondUserTodos = allTodos.filter(
      (todo) => todo.userId.toString() === secondUserId,
    );

    expect(firstUserTodos.length).toBe(1);
    expect(secondUserTodos.length).toBe(1);

    // Verify content separation
    expect(firstUserTodos[0].title).toBe(firstTodoDto.title);
    expect(firstUserTodos[0].description).toBe(firstTodoDto.description);
    expect(firstUserTodos[0].userId.toString()).toBe(userId);

    expect(secondUserTodos[0].title).toBe(secondTodoDto.title);
    expect(secondUserTodos[0].description).toBe(secondTodoDto.description);
    expect(secondUserTodos[0].userId.toString()).toBe(secondUserId);

    // Verify API responses are correct
    expect(firstRes.body.result.userId).toBe(userId);
    expect(firstRes.body.result.title).toBe(firstTodoDto.title);
    expect(secondRes.body.result.userId).toBe(secondUserId);
    expect(secondRes.body.result.title).toBe(secondTodoDto.title);
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
    const todoDto = generateTestTodoDto('no_auth');
    const res = await request(testConfig.baseUri).post('/todo').send(todoDto);
    expect(res.status).toBe(401);
    expect(res.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);

    // Check that it is not saved in the database
    const todoCount = await TodoMongoModel.countDocuments({}).exec();
    expect(todoCount).toBe(0);
  });
});

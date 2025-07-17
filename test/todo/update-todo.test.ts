import { CreateTodoDto, UpdateTodoDto } from '../../src/modules/todo/dto';
import { createTestUser, generateTestUserDto, createTestTodo } from '../common';
import { getAuthTokens } from '../common/auth.helper';
import * as request from 'supertest';
import { testConfig } from '../test-config';
import { ErrorCode } from '../../src/core/error/error-code';

describe('Todo - Update', () => {
  let accessToken: string;

  beforeEach(async () => {
    const userDto = generateTestUserDto('update_todo');
    await createTestUser(userDto);
    const tokens = await getAuthTokens(userDto.nickname, userDto.password);
    accessToken = tokens.accessToken;
  });

  it('should update a todo', async () => {
    const createRes = await createTestTodo(accessToken, {
      title: 'Update Todo',
      description: 'Update Desc',
    });
    const todoId = createRes.body.result.id;

    const updateDto: UpdateTodoDto = {
      title: 'Updated Title',
      completed: true,
    };
    const updateRes = await request(testConfig.baseUri)
      .patch(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateDto);
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.result.title).toBe(updateDto.title);
    expect(updateRes.body.result.completed).toBe(true);
  });

  it('should return 404 for non-existent todo', async () => {
    const updateDto: UpdateTodoDto = { title: 'X' };
    const fakeId = '507f1f77bcf86cd799439099';
    const res = await request(testConfig.baseUri)
      .patch(`/todo/${fakeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateDto);
    expect(res.status).toBe(404);
    expect(res.body.meta.errorCode).toBe(ErrorCode.TODO_NOT_FOUND);
  });

  it('should return 400 for invalid update payload', async () => {
    const createRes = await createTestTodo(accessToken, {
      title: 'Invalid Update',
      description: 'desc',
    });
    const todoId = createRes.body.result.id;

    const res = await request(testConfig.baseUri)
      .patch(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.meta.errorMessage).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Title cannot be empty'),
      ]),
    );
  });

  it('should return 401 if no token is provided', async () => {
    const createRes = await createTestTodo(accessToken, {
      title: 'No Auth Update',
      description: 'desc',
    });
    const todoId = createRes.body.result.id;

    const res = await request(testConfig.baseUri)
      .patch(`/todo/${todoId}`)
      .send({ title: 'X' });
    expect(res.status).toBe(401);
    expect(res.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('should only allow user to update their own todos (user isolation)', async () => {
    // User A creates a todo
    const userATodoRes = await createTestTodo(accessToken, {
      title: 'User A Todo',
      description: 'User A Description',
    });
    const todoId = userATodoRes.body.result.id;

    // Create User B
    const userBDto = generateTestUserDto('update_b');
    await createTestUser(userBDto);
    const userBTokens = await getAuthTokens(
      userBDto.nickname,
      userBDto.password,
    );
    const userBAccessToken = userBTokens.accessToken;

    // User B tries to update User A's todo - should return 404 (not found) for security
    const updateDto: UpdateTodoDto = {
      title: 'Hacked Title',
      description: 'Hacked Description',
      completed: true,
    };

    const updateRes = await request(testConfig.baseUri)
      .patch(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${userBAccessToken}`)
      .send(updateDto);

    expect(updateRes.status).toBe(404);
    expect(updateRes.body.meta.errorCode).toBe(ErrorCode.TODO_NOT_FOUND);

    // Verify original todo is unchanged - User A can still access it
    const originalTodoRes = await request(testConfig.baseUri)
      .get('/todo')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(originalTodoRes.status).toBe(200);
    const originalTodo = originalTodoRes.body.result.todos.find(
      (t: any) => t.id === todoId || t._id === todoId,
    );
    expect(originalTodo).toBeTruthy();
    expect(originalTodo.title).toBe('User A Todo');
    expect(originalTodo.description).toBe('User A Description');
    expect(originalTodo.completed).toBe(false);

    // Verify User A can still update their own todo
    const validUpdateDto: UpdateTodoDto = {
      title: 'User A Updated Title',
      completed: true,
    };

    const validUpdateRes = await request(testConfig.baseUri)
      .patch(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validUpdateDto);

    expect(validUpdateRes.status).toBe(200);
    expect(validUpdateRes.body.result.title).toBe(validUpdateDto.title);
    expect(validUpdateRes.body.result.completed).toBe(true);
  });
});

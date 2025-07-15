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

describe('Todo - Get/List', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    const userDto = generateTestUserDto('get_todo');
    const userRes = await createTestUser(userDto);
    userId = userRes.body.result.id;
    const tokens = await getAuthTokens(userDto.nickname, userDto.password);
    accessToken = tokens.accessToken;
  });

  it('should list todos for the user', async () => {
    const todoDto = generateTestTodoDto('list');
    await createTestTodo(accessToken, todoDto);

    const res = await request(testConfig.baseUri)
      .get('/todo')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result.todos)).toBe(true);
    expect(res.body.result.todos.length).toBeGreaterThan(0);
    expect(res.body.result.todos[0].userId).toBe(userId);
  });

  it('should support pagination', async () => {
    // Create 15 todos for pagination test
    for (let i = 0; i < 15; i++) {
      await createTestTodo(accessToken, {
        title: `Paginate ${i}`,
        description: 'desc',
      });
    }

    const res = await request(testConfig.baseUri)
      .get('/todo?page=2&limit=10')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.result.page).toBe(2);
    expect(res.body.result.todos.length).toBeGreaterThan(0);
  });

  it('should filter by completed', async () => {
    // Create a todo
    await createTestTodo(accessToken, {
      title: 'Done',
      description: 'desc',
    });

    // Get the todo to mark it as completed
    const todosRes = await request(testConfig.baseUri)
      .get('/todo')
      .set('Authorization', `Bearer ${accessToken}`);
    const todoId =
      todosRes.body.result.todos[0].id || todosRes.body.result.todos[0]._id;

    // Mark todo as completed
    await request(testConfig.baseUri)
      .patch(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ completed: true });

    // Filter by completed todos
    const filtered = await request(testConfig.baseUri)
      .get('/todo?completed=true')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(filtered.status).toBe(200);
    expect(filtered.body.result.todos.every((t: any) => t.completed)).toBe(
      true,
    );
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(testConfig.baseUri).get('/todo');
    expect(res.status).toBe(401);
    expect(res.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);
  });
});

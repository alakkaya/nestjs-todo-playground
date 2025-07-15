import { CreateTodoDto } from '../../src/modules/todo/dto';
import { createTestUser, generateTestUserDto } from '../common/user.helper';
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
    const todoDto: CreateTodoDto = {
      title: 'List Todo',
      description: 'List Desc',
    };
    await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(todoDto);
    const res = await request(testConfig.baseUri)
      .get('/todo')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result.todos)).toBe(true);
    expect(res.body.result.todos.length).toBeGreaterThan(0);
    expect(res.body.result.todos[0].userId).toBe(userId);
  });

  it('should support pagination', async () => {
    for (let i = 0; i < 15; i++) {
      await request(testConfig.baseUri)
        .post('/todo')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: `Paginate ${i}`, description: 'desc' });
    }
    const res = await request(testConfig.baseUri)
      .get('/todo?page=2&limit=10')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.result.page).toBe(2);
    expect(res.body.result.todos.length).toBeGreaterThan(0);
  });

  it('should filter by completed', async () => {
    // create completed and uncompleted todos
    await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Done', description: 'desc' });
    const todosRes = await request(testConfig.baseUri)
      .get('/todo')
      .set('Authorization', `Bearer ${accessToken}`);
    const todoId =
      todosRes.body.result.todos[0].id || todosRes.body.result.todos[0]._id;
    await request(testConfig.baseUri)
      .patch(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ completed: true });
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

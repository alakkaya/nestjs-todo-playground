import { CreateTodoDto, UpdateTodoDto } from '../../src/modules/todo/dto';
import { createTestUser, generateTestUserDto } from '../common/user.helper';
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
    const todoDto: CreateTodoDto = {
      title: 'Update Todo',
      description: 'Update Desc',
    };
    const createRes = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(todoDto);
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
    const todoDto: CreateTodoDto = {
      title: 'Invalid Update',
      description: 'desc',
    };
    const createRes = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(todoDto);
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
    const todoDto: CreateTodoDto = {
      title: 'No Auth Update',
      description: 'desc',
    };
    const createRes = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(todoDto);
    const todoId = createRes.body.result.id;
    const res = await request(testConfig.baseUri)
      .patch(`/todo/${todoId}`)
      .send({ title: 'X' });
    expect(res.status).toBe(401);
    expect(res.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);
  });
});

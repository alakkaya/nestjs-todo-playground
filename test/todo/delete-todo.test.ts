import { CreateTodoDto } from '../../src/modules/todo/dto';
import { createTestUser, generateTestUserDto } from '../common/user.helper';
import { getAuthTokens } from '../common/auth.helper';
import * as request from 'supertest';
import { testConfig } from '../test-config';
import { ErrorCode } from '../../src/core/error/error-code';
import { TodoMongoModel } from '../../test/common';

describe('Todo - Delete', () => {
  let accessToken: string;

  beforeEach(async () => {
    const userDto = generateTestUserDto('delete_todo');
    await createTestUser(userDto);
    const tokens = await getAuthTokens(userDto.nickname, userDto.password);
    accessToken = tokens.accessToken;
  });

  it('should delete a todo', async () => {
    const todoDto: CreateTodoDto = {
      title: 'Delete Todo',
      description: 'Delete Desc',
    };
    const createRes = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(todoDto);
    const todoId = createRes.body.result.id;

    // Verify todo exists in database before deletion
    const todoBeforeDeletion = await TodoMongoModel.findById(todoId)
      .lean()
      .exec();
    expect(todoBeforeDeletion).toBeTruthy();

    // Delete the todo
    const delRes = await request(testConfig.baseUri)
      .delete(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(delRes.status).toBe(200);

    // Verify todo is actually deleted from database
    const todoAfterDeletion = await TodoMongoModel.findById(todoId)
      .lean()
      .exec();
    expect(todoAfterDeletion).toBeNull();

    // Verify database count decreased
    const todoCount = await TodoMongoModel.countDocuments({}).exec();
    expect(todoCount).toBe(0);

    // Try to delete again - should return 404
    const delRes2 = await request(testConfig.baseUri)
      .delete(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(delRes2.status).toBe(404);
    expect(delRes2.body.meta.errorCode).toBe(ErrorCode.TODO_NOT_FOUND);
  });

  it('should return 404 for non-existent todo', async () => {
    const fakeId = '507f1f77bcf86cd799439099';
    const res = await request(testConfig.baseUri)
      .delete(`/todo/${fakeId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
    expect(res.body.meta.errorCode).toBe(ErrorCode.TODO_NOT_FOUND);
  });

  it('should return 401 if no token is provided', async () => {
    const todoDto: CreateTodoDto = {
      title: 'No Auth Delete',
      description: 'desc',
    };
    const createRes = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(todoDto);
    const todoId = createRes.body.result.id;
    const res = await request(testConfig.baseUri).delete(`/todo/${todoId}`);
    expect(res.status).toBe(401);
    expect(res.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('should only allow user to delete their own todos', async () => {
    // User A creates a todo
    const userATodoDto: CreateTodoDto = {
      title: 'User A Todo',
      description: 'User A Description',
    };
    const createRes = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(userATodoDto);
    const todoId = createRes.body.result.id;

    // Verify todo exists in database
    const todoBeforeDelete = await TodoMongoModel.findById(todoId)
      .lean()
      .exec();
    expect(todoBeforeDelete).toBeTruthy();
    expect(todoBeforeDelete.title).toBe(userATodoDto.title);

    // Create User B
    const userBDto = generateTestUserDto('del_user_b');
    await createTestUser(userBDto);
    const userBTokens = await getAuthTokens(
      userBDto.nickname,
      userBDto.password,
    );
    const userBAccessToken = userBTokens.accessToken;

    // User B tries to delete User A's todo - should return 404 (not found) for security
    const deleteRes = await request(testConfig.baseUri)
      .delete(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${userBAccessToken}`);
    expect(deleteRes.status).toBe(404);
    expect(deleteRes.body.meta.errorCode).toBe(ErrorCode.TODO_NOT_FOUND);

    // Verify todo still exists in database (User B couldn't delete it)
    const todoAfterFailedDelete = await TodoMongoModel.findById(todoId)
      .lean()
      .exec();
    expect(todoAfterFailedDelete).toBeTruthy();
    expect(todoAfterFailedDelete.title).toBe(userATodoDto.title);
    expect(todoAfterFailedDelete.description).toBe(userATodoDto.description);

    // Verify User A can still delete their own todo
    const validDeleteRes = await request(testConfig.baseUri)
      .delete(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(validDeleteRes.status).toBe(200);

    // Verify todo is now actually deleted from database
    const finalCheck = await TodoMongoModel.findById(todoId).lean().exec();
    expect(finalCheck).toBeNull();

    // Verify database count is 0
    const todoCount = await TodoMongoModel.countDocuments({}).exec();
    expect(todoCount).toBe(0);
  });
});

import { CreateTodoDto } from '../../src/modules/todo/dto';
import { createTestUser, generateTestUserDto } from '../common/user.helper';
import { getAuthTokens } from '../common/auth.helper';
import * as request from 'supertest';
import { testConfig } from '../test-config';
import { ErrorCode } from '../../src/core/error/error-code';
import { sleep, TodoMongoModel } from '../../test/common';

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

    // Delete the todo (should schedule deletion job)
    const delRes = await request(testConfig.baseUri)
      .delete(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.result.remainingTime).toBe(4000);
    expect(delRes.body.result.jobId).toBeDefined();

    // Verify todo still exists immediately after delete request (delayed deletion)
    const todoAfterDeleteRequest = await TodoMongoModel.findById(todoId)
      .lean()
      .exec();
    expect(todoAfterDeleteRequest).toBeTruthy();

    await sleep(5000); // more than the deletion delay (4s)

    // Verify todo is actually deleted from database after delay
    const todoAfterDelay = await TodoMongoModel.findById(todoId).lean().exec();
    expect(todoAfterDelay).toBeNull();

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

  it('should handle concurrent delete requests (race condition protection)', async () => {
    // Create a todo for race condition testing
    const todoRes = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Race Test', description: 'Test' });
    const todoId = todoRes.body.result.id;

    // Send 10 concurrent delete requests
    const deletePromises = Array.from({ length: 10 }, () =>
      request(testConfig.baseUri)
        .delete(`/todo/${todoId}`)
        .set('Authorization', `Bearer ${accessToken}`),
    );

    // Promise.allSettled -> Wait for all to complete regardless of success/failure
    const results = await Promise.allSettled(deletePromises);
    const responses = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);

    // Only 1 should succeed (200), others should get race condition (409)
    const successful = responses.filter((r) => r.status === 200);
    const raceConditions = responses.filter((r) => r.status === 409);

    expect(successful).toHaveLength(1);
    expect(raceConditions).toHaveLength(9);
    expect(successful[0].body.result.jobId).toBeDefined();
    expect(successful[0].body.result.remainingTime).toBe(4000);
  });

  it('should return 409 if deletion is already pending', async () => {
    // Create a todo
    const todoRes = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Pending Test', description: 'Test' });
    const todoId = todoRes.body.result.id;

    // First delete request - should succeed
    const firstDelete = await request(testConfig.baseUri)
      .delete(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(firstDelete.status).toBe(200);

    // Second delete request - should fail with 409 because deletion is pending
    const secondDelete = await request(testConfig.baseUri)
      .delete(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(secondDelete.status).toBe(409);
    expect(secondDelete.body.meta.errorCode).toBe(
      ErrorCode.TODO_DELETION_PENDING,
    );
  });

  it('should support cancellation of pending deletion', async () => {
    // Create a todo
    const todoRes = await request(testConfig.baseUri)
      .post('/todo')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Cancel Test', description: 'Test' });
    const todoId = todoRes.body.result.id;

    // Schedule deletion
    const deleteRes = await request(testConfig.baseUri)
      .delete(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(deleteRes.status).toBe(200);

    // Cancel the deletion
    const cancelRes = await request(testConfig.baseUri)
      .post(`/todo/${todoId}/cancel-deletion`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(cancelRes.status).toBe(201);

    // Todo should still exist even after delay
    await sleep(5000); // Wait longer than deletion delay
    const todoAfterCancel = await TodoMongoModel.findById(todoId).lean().exec();
    expect(todoAfterCancel).toBeTruthy();

    // Should be able to delete again
    const secondDeleteRes = await request(testConfig.baseUri)
      .delete(`/todo/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(secondDeleteRes.status).toBe(200);
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

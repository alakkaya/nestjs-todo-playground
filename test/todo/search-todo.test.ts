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

describe('Todo - Search', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    const userDto = generateTestUserDto('search_todo');
    const userRes = await createTestUser(userDto);
    userId = userRes.body.result.id;
    const tokens = await getAuthTokens(userDto.nickname, userDto.password);
    accessToken = tokens.accessToken;
  });

  it('should search todos by title', async () => {
    // Create todos for search test
    await createTestTodo(accessToken, {
      title: 'Meeting',
      description: 'Discuss project',
    });
    await createTestTodo(accessToken, {
      title: 'Shopping',
      description: 'Buy milk',
    });
    // Wait for Elasticsearch to index the new todos
    await new Promise((r) => setTimeout(r, 1500));
    const res = await request(testConfig.baseUri)
      .get('/todo/search?query=Meet')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    // Check that at least one todo is found
    expect(res.body.result.todos.length).toBeGreaterThan(0);
    // Check that the first todo's title contains 'Meeting'
    expect(res.body.result.todos[0].title).toContain('Meeting');
    // Ensure all todos belong to the test user
    expect(res.body.result.todos.every((t: any) => t.userId === userId)).toBe(
      true,
    );
  });

  it('should search todos by description', async () => {
    // Create a todo with 'project' in the description
    await createTestTodo(accessToken, {
      title: 'Random',
      description: 'Discuss project',
    });
    // Wait for Elasticsearch to index
    await new Promise((r) => setTimeout(r, 1500));
    const res = await request(testConfig.baseUri)
      .get('/todo/search?query=project')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    // Check that at least one todo is found
    expect(res.body.result.todos.length).toBeGreaterThan(0);
    // Check that the first todo's description contains 'project'
    expect(res.body.result.todos[0].description).toContain('project');
  });

  it('should return empty array if no match', async () => {
    await createTestTodo(accessToken, { title: 'Test', description: 'desc' });

    const res = await request(testConfig.baseUri)
      .get('/todo/search?query=notfound')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result.todos)).toBe(true);
    expect(res.body.result.todos.length).toBe(0);
    expect(res.body.result.total).toBe(0);
  });

  it('should support pagination', async () => {
    // Create 15 todos for pagination test
    for (let i = 0; i < 15; i++) {
      await createTestTodo(accessToken, {
        title: `Paginate ${i}`,
        description: 'desc',
      });
    }
    // Wait for Elasticsearch to index all todos
    await new Promise((r) => setTimeout(r, 1500));
    const res = await request(testConfig.baseUri)
      .get('/todo/search?query=Paginate&page=2&limit=10')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    // Check pagination values
    expect(res.body.result.page).toBe(2);
    expect(res.body.result.limit).toBe(10);
    // Should return 5 todos on the second page
    expect(res.body.result.todos.length).toBe(5);
    expect(res.body.result.total).toBe(15);
    expect(res.body.result.totalPages).toBe(2);
  });

  it('should isolate todos between users', async () => {
    // Create a todo for User A
    await createTestTodo(accessToken, {
      title: 'UserA Todo',
      description: 'desc',
    });
    // Create User B with a short nickname to avoid validation error
    const userBDto = generateTestUserDto('usrB');
    const userBRes = await createTestUser(userBDto);
    const userBId = userBRes.body.result.id;
    const userBTokens = await getAuthTokens(
      userBDto.nickname,
      userBDto.password,
    );
    const userBAccessToken = userBTokens.accessToken;
    // Create a todo for User B
    await createTestTodo(userBAccessToken, {
      title: 'UserB Todo',
      description: 'desc',
    });
    // Wait for Elasticsearch to index todos for both users
    await new Promise((r) => setTimeout(r, 1500));
    // User A search
    const userARes = await request(testConfig.baseUri)
      .get('/todo/search?query=Todo')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(userARes.status).toBe(200);
    // Ensure all found todos belong to User A
    expect(
      userARes.body.result.todos.every((t: any) => t.userId === userId),
    ).toBe(true);
    // User B search
    const userBResSearch = await request(testConfig.baseUri)
      .get('/todo/search?query=Todo')
      .set('Authorization', `Bearer ${userBAccessToken}`);
    expect(userBResSearch.status).toBe(200);
    // Ensure all found todos belong to User B
    expect(
      userBResSearch.body.result.todos.every((t: any) => t.userId === userBId),
    ).toBe(true);
  });

  it('should return 400 for missing query', async () => {
    const res = await request(testConfig.baseUri)
      .get('/todo/search')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.meta.errorCode).toBeNull();
    expect(Array.isArray(res.body.meta.errorMessage)).toBe(true);
    expect(res.body.result.statusCode).toBe(400);
  });

  it('should return 400 for invalid page/limit', async () => {
    const res = await request(testConfig.baseUri)
      .get('/todo/search?query=test&page=0&limit=0')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.meta.errorCode).toBeNull();
    expect(Array.isArray(res.body.meta.errorMessage)).toBe(true);
    expect(res.body.result.statusCode).toBe(400);
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(testConfig.baseUri).get(
      '/todo/search?query=test',
    );

    expect(res.status).toBe(401);
    expect(res.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);
  });
});

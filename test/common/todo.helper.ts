import * as request from 'supertest';
import { testConfig } from '../test-config';
import { CreateTodoDto } from '../../src/modules/todo/dto';

export async function createTestTodo(
  accessToken: string,
  dto?: Partial<CreateTodoDto>,
) {
  const defaultDto: CreateTodoDto = {
    title: 'Test Todo',
    description: 'Test Description',
  };

  const todoDto = { ...defaultDto, ...dto };

  return request(testConfig.baseUri)
    .post('/todo')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(todoDto);
}

export function generateTestTodoDto(prefix: string = 'test'): CreateTodoDto {
  return {
    title: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Todo`,
    description: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Description`,
  };
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

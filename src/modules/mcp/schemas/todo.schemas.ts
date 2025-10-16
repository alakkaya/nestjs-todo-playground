export const TodoSchemas = {
  create: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'User ID from login' },
      title: { type: 'string', description: 'Todo title' },
      description: { type: 'string', description: 'Todo description' },
    },
    required: ['userId', 'title'],
  },
  get: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'User ID' },
      page: { type: 'number', description: 'Page number' },
      limit: { type: 'number', description: 'Items per page' },
    },
    required: ['userId'],
  },
  update: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      todoId: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      completed: { type: 'boolean' },
    },
    required: ['userId', 'todoId'],
  },
  delete: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      todoId: { type: 'string' },
    },
    required: ['userId', 'todoId'],
  },
  cancelDeletion: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      todoId: { type: 'string' },
    },
    required: ['userId', 'todoId'],
  },
};

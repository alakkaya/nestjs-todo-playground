export const McpTool = {
  AUTH_REGISTER: {
    name: 'auth_register',
    description: 'Register a new user',
    category: 'auth' as const,
  },
  AUTH_LOGIN: {
    name: 'auth_login',
    description: 'Login user and get access token',
    category: 'auth' as const,
  },
  TODO_CREATE: {
    name: 'todo_create',
    description: 'Create a new todo item',
    category: 'todo' as const,
  },
  TODO_LIST: {
    name: 'todo_list',
    description: 'List user todos with pagination',
    category: 'todo' as const,
  },
  TODO_UPDATE: {
    name: 'todo_update',
    description: 'Update an existing todo',
    category: 'todo' as const,
  },
  TODO_DELETE: {
    name: 'todo_delete',
    description: 'Delete a todo item',
    category: 'todo' as const,
  },
} as const;

// Type utilities
export type McpToolKey = keyof typeof McpTool;
export type McpToolValue = (typeof McpTool)[McpToolKey];
export type McpToolName = McpToolValue['name'];
export type McpToolCategory = McpToolValue['category'];

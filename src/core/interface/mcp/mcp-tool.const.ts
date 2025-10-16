export const McpTool = {
  AUTH_REGISTER: {
    name: 'auth_register',
    description: 'Register a new user. Start here to create your account.',
    category: 'auth' as const,
  },
  AUTH_LOGIN: {
    name: 'auth_login',
    description:
      'Login user and get access token. Use this after registration to get your userId and tokens.',
    category: 'auth' as const,
  },
  TODO_CREATE: {
    name: 'todo_create',
    description:
      'Create a new todo item. IMPORTANT: You must first login with auth_login to get your userId.',
    category: 'todo' as const,
  },
  TODO_GET: {
    name: 'todo_get',
    description:
      'Get user todos with pagination. IMPORTANT: You must provide the userId from auth_login response.',
    category: 'todo' as const,
  },
  TODO_UPDATE: {
    name: 'todo_update',
    description:
      'Update an existing todo. IMPORTANT: You need both todoId (from todo_create/todo_get) and userId (from auth_login).',
    category: 'todo' as const,
  },
  TODO_DELETE: {
    name: 'todo_delete',
    description:
      'Schedule todo for deletion (delayed 4 seconds). IMPORTANT: You need todoId and userId. Returns jobId for potential cancellation.',
    category: 'todo' as const,
  },
  TODO_CANCEL_DELETION: {
    name: 'todo_cancel_deletion',
    description:
      'Cancel pending todo deletion (only works within 4 seconds). IMPORTANT: Use the todoId and userId to identify which deletion to cancel.',
    category: 'todo' as const,
  },
} as const;

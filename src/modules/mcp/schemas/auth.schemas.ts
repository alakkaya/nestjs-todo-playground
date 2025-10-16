export const AuthSchemas = {
  register: {
    type: 'object',
    properties: {
      fullname: {
        type: 'string',
        description: "User's full name",
      },
      nickname: {
        type: 'string',
        description: 'Unique username',
      },
      password: {
        type: 'string',
        description: 'User password',
      },
    },
    required: ['fullname', 'nickname', 'password'],
  },
  login: {
    type: 'object',
    properties: {
      nickname: {
        type: 'string',
        description: 'Username',
      },
      password: {
        type: 'string',
        description: 'User password',
      },
    },
    required: ['nickname', 'password'],
  },
};

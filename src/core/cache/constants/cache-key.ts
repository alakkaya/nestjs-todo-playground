export const cacheKeys = {
  tokens: {
    refreshToken: (userId: string) => `token:refresh:${userId}`,
  },
  jobs: {
    todoDeletion: (todoId: string, userId: string) =>
      `delayed-job:todo-deletion:${todoId}:${userId}`,
  },
  locks: {
    todoDeletion: (todoId: string) => `lock:todo-deletion:${todoId}`,
  },
};

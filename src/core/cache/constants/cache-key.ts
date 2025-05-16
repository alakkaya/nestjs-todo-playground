export const cacheKeys = {
  tokens: {
    refreshToken: (userId: string) => `token:refresh:${userId}`,
  },
};

export interface Environment {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET_ACCESS: string;
  JWT_SECRET_REFRESH: string;
  JWT_EXPIRATION_ACCESS: string;
  JWT_EXPIRATION_REFRESH: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
}

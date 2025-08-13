export interface Environment {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET_ACCESS: string;
  JWT_SECRET_REFRESH: string;
  JWT_EXPIRATION_ACCESS: string;
  JWT_EXPIRATION_REFRESH: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  ELASTICSEARCH_NODE: string;
  ELASTICSEARCH_USERNAME: string;
  ELASTICSEARCH_PASSWORD: string;
  RABBITMQ_URL: string;
  RABBITMQ_QUEUE_TODO_EVENTS: string;
}

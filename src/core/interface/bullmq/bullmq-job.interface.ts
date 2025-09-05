export interface BullMQJob<T = any> {
  id: string;
  data: T;
  delay?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

export interface BullMQJobOptions {
  delay?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

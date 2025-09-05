import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TodoDeletionJobData, BullMQJobOptions } from 'src/core/interface';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class TodoDeletionJobService {
  private readonly deletionDelay: number;

  constructor(
    @InjectQueue('todo-deletion-jobs') private todoDeletionQueue: Queue,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.deletionDelay = this.configService.get(
      'DELAYED_JOB_DEFAULT_DELAY',
      4000,
    );
  }

  async scheduleDeletion(todoId: string, userId: string): Promise<string> {
    const jobKey = this.generateJobKey(todoId, userId);

    // Cancel existing job if any
    await this.cancelExistingJob(jobKey);

    // Create a new job
    const job = await this.todoDeletionQueue.add(
      'delete-todo',
      { todoId, userId } as TodoDeletionJobData,
      {
        delay: this.deletionDelay,
        removeOnComplete: true,
        removeOnFail: true,
      } as BullMQJobOptions,
    );

    // Store the job ID in Redis (TTL 6 seconds - 4 seconds delay + 2 seconds buffer)
    await this.redis.setex(jobKey, 6, job.id);

    return job.id;
  }

  async cancelDeletion(todoId: string, userId: string): Promise<boolean> {
    const jobKey = this.generateJobKey(todoId, userId);
    const jobId = await this.redis.get(jobKey);

    if (jobId) {
      const job = await this.todoDeletionQueue.getJob(jobId);
      if (job) {
        await job.remove();
        await this.redis.del(jobKey);
        return true;
      }
    }
    return false;
  }

  async isPendingDeletion(todoId: string, userId: string): Promise<boolean> {
    const jobKey = this.generateJobKey(todoId, userId);
    const jobId = await this.redis.get(jobKey);

    if (jobId) {
      const job = await this.todoDeletionQueue.getJob(jobId);
      return job !== null;
    }
    return false;
  }

  private generateJobKey(todoId: string, userId: string): string {
    return `delayed-job:todo-deletion:${todoId}:${userId}`;
  }

  private async cancelExistingJob(jobKey: string): Promise<void> {
    const existingJobId = await this.redis.get(jobKey);

    if (existingJobId) {
      const existingJob = await this.todoDeletionQueue.getJob(existingJobId);
      if (existingJob) {
        await existingJob.remove();
      }
      await this.redis.del(jobKey);
    }
  }
}

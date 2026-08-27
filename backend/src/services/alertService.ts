import { redis } from '../config/redis';

export const publishEvent = async (channel: string, message: any) => {
  try {
    await redis.publish(channel, JSON.stringify(message));
  } catch (error) {
    console.error(`Failed to publish to ${channel}:`, error);
  }
};

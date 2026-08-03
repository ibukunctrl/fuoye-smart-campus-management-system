import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Distributed Redis Lock Service for Concurrency Control
 * Prevents race conditions during portal rush (e.g. 100 students booking the same hostel room at the same ms).
 */
export class LockService {
  /**
   * Acquires a lock for a resource.
   * @param resourceKey Unique identifier for the resource (e.g. "room:104")
   * @param ttlMs Time-to-live in milliseconds before lock auto-expires (prevents deadlocks)
   * @returns lockToken (UUID or timestamp string) if acquired, throws AppError if busy
   */
  public static async acquireLock(resourceKey: string, ttlMs = 5000): Promise<string> {
    const lockKey = `lock:${resourceKey}`;
    const lockToken = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // SET key value NX (only if not exists) PX (milliseconds)
    const acquired = await redis.set(lockKey, lockToken, 'PX', ttlMs, 'NX');

    if (!acquired) {
      logger.warn({ resourceKey }, '🔒 Failed to acquire lock: Resource currently locked by another request');
      throw new AppError(
        'This room is currently being processed by another user. Please try again in a few seconds.',
        409,
        ERROR_CODES.ROOM_ALREADY_BOOKED
      );
    }

    logger.debug({ resourceKey, lockToken }, '🔐 Lock acquired successfully');
    return lockToken;
  }

  /**
   * Releases a lock safely using a Lua script to ensure we only unlock our own token.
   */
  public static async releaseLock(resourceKey: string, lockToken: string): Promise<boolean> {
    const lockKey = `lock:${resourceKey}`;
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await redis.eval(luaScript, 1, lockKey, lockToken);
      if (result === 1) {
        logger.debug({ resourceKey }, '🔓 Lock released successfully');
        return true;
      }
      return false;
    } catch (err) {
      logger.error({ err, resourceKey }, '❌ Error releasing Redis lock');
      return false;
    }
  }
}

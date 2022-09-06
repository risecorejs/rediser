import redis from 'redis';
import { IOptions } from './interfaces';
import { TRediserHandler } from './types';
/**
 * REDISER
 * @param options {IOptions}
 * @return {Promise<TRediserHandler>}
 */
export default function (options?: IOptions & redis.RedisClientOptions): Promise<TRediserHandler>;

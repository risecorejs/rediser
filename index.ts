const models = require('@risecorejs/core/models')

import { getRedisClient } from '@risecorejs/helpers'
import redis from 'redis'

import { IModel, IOptions } from './interfaces'
import { TModelOptions, TRediserHandler } from './types'

/**
 * REDISER
 * @param options {IOptions}
 * @return {Promise<TRediserHandler>}
 */
export default async function (options?: IOptions & redis.RedisClientOptions): Promise<TRediserHandler> {
  const redisClient = options?.redisClient || (await getRedisClient(options))

  return async function (
    redisKey: string,
    model: string | IModel,
    options?: IOptions & { defaultValue?: () => any }
  ): Promise<any> {
    const modelOptions = getModelOptions(model)

    const _redisClient = options?.redisClient || redisClient

    const redisData = await _redisClient.get(redisKey)

    if (redisData) {
      return JSON.parse(redisData)
    } else {
      const Model = getModel(modelOptions)

      if (Model) {
        const dbData = await Model[modelOptions.method](modelOptions.options)

        await _redisClient.set(redisKey, JSON.stringify(dbData))

        if ((!dbData || !dbData.length) && options?.defaultValue) {
          return options.defaultValue()
        }

        return dbData
      }
    }
  }
}

/**
 * GET-MODEL-OPTIONS
 * @param model {string | IModel}
 * @return {TModelOptions}
 */
function getModelOptions(model: string | IModel): TModelOptions {
  if (typeof model === 'string') {
    return {
      name: model,
      method: 'findOne',
      options: {}
    }
  } else {
    return {
      model: model.model,
      name: model.name,
      method: model.method || 'findOne',
      options: model.options || {}
    }
  }
}

/**
 * GET-MODEL
 * @param modelOptions {TModelOptions}
 * @return {{ [key: string]: any } | undefined}
 */
function getModel(modelOptions: TModelOptions): { [key: string]: any } | undefined {
  if (modelOptions.model) {
    return modelOptions.model
  } else if (modelOptions.name) {
    return models[modelOptions.name]
  }
}

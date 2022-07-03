const getRedisClient = require('@risecorejs/helpers/lib/get-redis-client')
const models = require('@risecorejs/core/models')

/**
 * REDISER
 * @param options
 * @returns {Promise<(function(*, *, *): Promise<any>)|*>}
 */
module.exports = async (options) => {
  const redisClient = options?.redisClient || (await getRedisClient((redisOptions = options)))

  return async (redisKey, model, options) => {
    if (typeof model === 'string') {
      model = {
        name: model,
        method: 'findOne',
        options: {}
      }
    } else {
      model = {
        model: model.model,
        name: model.name,
        method: model.method || 'findOne',
        options: model.options || {}
      }
    }

    const _redisClient = options?.redisClient || redisClient

    const redisData = await _redisClient.get(redisKey)

    if (redisData) {
      return JSON.parse(redisData)
    } else {
      const dbData = await (model.model || models[model.name])[model.method](model.options)

      await _redisClient.set(redisKey, JSON.stringify(dbData))

      if ((!dbData || !dbData.length) && options?.defaultValue) {
        return options.defaultValue()
      }

      return dbData
    }
  }
}

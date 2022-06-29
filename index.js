const getRedisClient = require('@risecorejs/helpers/lib/get-redis-client')
const models = require('@risecorejs/core/models')

/**
 * REDISER
 * @param redisOptions {Object?}
 * @returns {(function(*, *, *): Promise<any>)|*}
 */
module.exports = (redisOptions) => async (redisKey, model, options) => {
  const redisClient = await getRedisClient(redisOptions)

  if (typeof model === 'string') {
    model = {
      name: model,
      method: 'findOne',
      options: {}
    }
  } else {
    model = {
      name: model.name,
      method: model.method || 'findOne',
      options: model.options || {}
    }
  }

  const redisData = await redisClient.get(redisKey)

  if (redisData) {
    return JSON.parse(redisData)
  } else {
    const Model = models[model.name]

    const dbData = await Model[model.method](model.options)

    await redisClient.set(redisKey, JSON.stringify(dbData))

    await redisClient.quit()

    if ((!dbData || !dbData.length) && options?.defaultValue) {
      return await options.defaultValue()
    }

    return dbData
  }
}

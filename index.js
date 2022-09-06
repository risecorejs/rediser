"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models = require('@risecorejs/core/models');
const helpers_1 = require("@risecorejs/helpers");
/**
 * REDISER
 * @param options {IOptions}
 * @return {Promise<TRediserHandler>}
 */
async function default_1(options) {
    const redisClient = options?.redisClient || (await (0, helpers_1.getRedisClient)(options));
    return async function (redisKey, model, options) {
        const modelOptions = getModelOptions(model);
        const _redisClient = options?.redisClient || redisClient;
        const redisData = await _redisClient.get(redisKey);
        if (redisData) {
            return JSON.parse(redisData);
        }
        else {
            const Model = getModel(modelOptions);
            if (Model) {
                const dbData = await Model[modelOptions.method](modelOptions.options);
                await _redisClient.set(redisKey, JSON.stringify(dbData));
                if ((!dbData || !dbData.length) && options?.defaultValue) {
                    return options.defaultValue();
                }
                return dbData;
            }
        }
    };
}
exports.default = default_1;
/**
 * GET-MODEL-OPTIONS
 * @param model {string | IModel}
 * @return {TModelOptions}
 */
function getModelOptions(model) {
    if (typeof model === 'string') {
        return {
            name: model,
            method: 'findOne',
            options: {}
        };
    }
    else {
        return {
            model: model.model,
            name: model.name,
            method: model.method || 'findOne',
            options: model.options || {}
        };
    }
}
/**
 * GET-MODEL
 * @param modelOptions {TModelOptions}
 * @return {{ [key: string]: any } | undefined}
 */
function getModel(modelOptions) {
    if (modelOptions.model) {
        return modelOptions.model;
    }
    else if (modelOptions.name) {
        return models[modelOptions.name];
    }
}

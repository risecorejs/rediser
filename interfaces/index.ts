export interface IOptions {
  redisClient?: any
  defaultValue: () => any | Promise<any>
}

export interface IModel {
  model?: object
  name?: string
  method?: string
  options?: object
}

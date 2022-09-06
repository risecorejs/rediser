import { IModel, IOptions } from '../interfaces';
export declare type TRediserHandler = (redisKey: string, model: string | IModel, options?: IOptions) => Promise<any>;
export declare type TModelOptions = {
    name: string;
    method: string;
    options: {};
    model?: undefined;
} | {
    model: object | undefined;
    name: string | undefined;
    method: string;
    options: object;
};

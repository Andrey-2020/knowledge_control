import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface parseError {
  (
    premessage: string,
    error: Error,
  ): string;
}

declare const http: AxiosInstance & {
  authTokenName: string,
  parseError: parseError,
  isCancel: typeof axios.isCancel,
  ifNotCancel: (error: Error) => ((error: Error) => void),
  returnData<T>(response: AxiosResponse<T>): T,
} = axios.create({
  baseURL: process.env.NODE_ENV !== 'production' ?
    process.env.REACT_APP__DEVELOPMENT_BASE_URL : process.env.REACT_APP__PRODUCTION_BASE_URL,
  timeout: 10000,
  paramsSerializer(params) {
    return qs.stringify(params, { arrayFormat: 'comma' });
  },
});

/**
 * Функция для человеческого отображения ошибок от сервера
 */
export function parseError(
  premessage: string,
  error: Error,
): string;

/**
 * Отобразить серверуную ошибку, возможно со статусом
 */
export function messageServerError(status?: number): string;

export default http;

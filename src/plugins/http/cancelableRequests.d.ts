import { AxiosRequestConfig } from 'axios';

/**
 * Хранилище "отменялок" запросов axios
 */
export declare const cancelableRequests: {
  [componentUid: string]: {
    [requestUid: string]: ?import('axios').Canceler
  },
} = {};

export interface AxiosRequestConfigWithCancel extends AxiosRequestConfig {
  forCancel?: {
    componentUid: string,
    requestUid: string,
  },
}

/**
 * Взятие из config'а идентификаторы компонента и запроса для отмены.
 * Если у запроса нет идентификатора, то берётся url. 
 */
export function getForCancel(config: AxiosRequestConfigWithCancel): [
  componentUid: string,
  requestUid: string,
]; 

/**
 * Функция для инициализации отменяемых запросов компонента
 */
export function registerComponent(componentUid: string): [ string ];

/**
 * Отменяет запрос компонента
 */
export function cancelRequest(
  componentUid: string,
  requestUid: string,
): void;

/**
 * Отменяет все запросы компонента
 */
export function cancelAllComponentRequests(componentUid: string): void;

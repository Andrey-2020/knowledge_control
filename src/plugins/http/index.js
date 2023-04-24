import axios from 'axios';
import { message } from 'antd';
import qs from 'qs';

import store from 'globalStore';

const http = axios.create({
  baseURL: process.env.NODE_ENV !== 'production' ?
    process.env.REACT_APP__DEVELOPMENT_API_HOST_HTTP : process.env.REACT_APP__PRODUCTION_API_HOST_HTTP,
  timeout: 10000,
  paramsSerializer(params) {
    return qs.stringify(params, { arrayFormat: 'comma' });
  },
});
// Название токена авторизации в headers
http.authTokenName = 'Authorization';

/**
 * Примесь перед запросом на просроченность токена.
 * Если просрочен, то запускается обновление
 */
http.interceptors.request.use((config) => {
  if (store.refrashToken &&
      store.refrashTokenExpired - new Date() < http.defaults.timeout) {
    return new Promise((resolve) => {
      store.refrashTokens(() => { resolve(config); });
    });
  } else {
    return Promise.resolve(config);
  }
});

/**
 * Задержка перед отправкой первого запроса, чтобы всё выставилось.
 * Возможно, уже не нужно и подлежит удалению
 */
const deferFirstRequest = http.interceptors.request.use((config) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Если в первом запросе нужен был "userId"
      if (config.params && 'userId' in config.params) {
        config.params.userId = store.userId;
      }
      // Если в первом запросе нужна была "userRole"
      if (config.params && 'userRole' in config.params) {
        config.params.userId = store.userRole;
      }
      // Выставление токена, если он был конечно
      config.headers[http.authTokenName] = http.defaults.headers.common[http.authTokenName];
      resolve(config);
      // Удалить примесь
      http.interceptors.request.eject(deferFirstRequest);
    });
  });
});

/**
 * Примесь на ошибочный ответ.
 * Если есть ответ от сервера и ответ с кодом 401 или 403,
 * то пользователь либо просрочил токен,
 * либо куда-то не туда постучался.
 * В любом случае надо его разлогинить
 */
http.interceptors.response.use((response) => response,
  (error) => {
    if (!axios.isCancel(error)) {
      console.log(error);
      // https://github.com/axios/axios#handling-errors
      if (error.response &&
          (error.response.status === 401 || error.response.status === 403)) {
        message.error('Данные аудентификации не были предоставлены', 5);
        store.logOut();
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Функция для человеческого отображения ошибок от сервера
 * 
 * @param {string} premessage - сообщение, которое будет написано перед ошибкой
 * @param {Error} error - какая-то ошибка, будет написана после ": "
 * 
 * @returns {string}
 */
export function parseError(premessage, error) {
  let message = 'программная ошибка, пожалуйста, обратитесь в техподдержку';
  // Если есть ответ
  if (error.response) {
    // Если статус меньше 500, то есть ответ не является ошибкой на сервере
    if (error.response.status < 500) {
      // Если data это объект с полем message
      if (typeof error.response.data === 'object' && error.response.data.message) {
        message = error.response.data.message;
      // Если неверный формат ответа от сервера
      } else {
        console.error('Invalid error format:', error.response.data);
        message = messageServerError();
      }
    // Если другой статус, то сервер ответил осмысленно
    } else {
      message = messageServerError(error.response.status);
    }
  // Если есть вариант перевести в toJSON
  } else if (error.toJSON) {
    console.error('error.toJSON:', error.toJSON());
    message = messageServerError(error.toJSON().message);
  // У ошибки наверняка есть сообщение
  } else {
    console.error('error.message:', error.message);
  }
  return `${premessage}: ${message}`;
}
/** В подсказки не добавляется, но дока подсвечивается */
http.parseError = parseError;

/**
 * Отобразить серверуную ошибку, возможно со статусом
 * 
 * @param {?number} status
 * 
 * @returns {string}
 */
function messageServerError(status) {
  return `серверная ошибка${status ? (' ' + status) : ''}. Пожалуйста, обратитесь в техподдержку`;
}

/**
 * @template T
 * @param {import('axios').AxiosResponse<T>} response
 * @returns {T}
 */
function returnData(response) {
  return response && response.data;
}
http.returnData = returnData;

export default http;

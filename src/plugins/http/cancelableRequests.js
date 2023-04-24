import axios from 'axios';

import http from 'plugins/http';

const CancelToken = axios.CancelToken;

/**
 * Хранилище "отменялок" запросов axios
 * 
 * @type {{
 *   [componentUid: string]: {
 *     [requestUid: string]: ?import('axios').Canceler
 *   }
 * }}
 */
const cancelableRequests = {};

/**
 * Взятие из config'а идентификаторы компонента и запроса для отмены.
 * Если у запроса нет идентификатора, то берётся url.
 * 
 * @param {import('./cancelableRequests').AxiosRequestConfigWithCancel} config - конфиг запроса axios
 * 
 * @returns {[
 *   componentUid: string,
 *   requestUid: string
 * ]} уникальные идентификаторы компонента и запроса (если у запроса нет, то берётся url) 
 */
function getForCancel(config) {
  let { componentUid, requestUid } = config.forCancel;
  if (!requestUid) {
    requestUid = config.url;
  }
  return [componentUid, requestUid];
}

http.isCancel = axios.isCancel;
/**
 * Декоратор, вызывающий обработчик ошибки, если ошибке не результат отмены
 * 
 * @param {(error: any) => void} catchCallback
 * 
 * @returns {(error: any) => void}
 */
 http.ifNotCancel = function(catchCallback) {
  return (error) => {
    !axios.isCancel(error) && catchCallback(error);
  };
}

/**
 * Примесь перед запросом для создания Canceller'а запроса
 */
http.interceptors.request.use((config) => {
  if (config.forCancel) {
    const [componentUid, requestUid] = getForCancel(config);

    const oldCanceller = cancelableRequests[componentUid][requestUid];
    if (oldCanceller) {
      oldCanceller();
    }

    config.cancelToken = new CancelToken((canceller) => {
      cancelableRequests[componentUid][requestUid] = canceller;
    });
  }
  
  return Promise.resolve(config);
});

/**
 * Примесь после запроса для удаления Canceller'а
 */
http.interceptors.response.use(
  (response) => {
    if (response.config.forCancel) {
      const [componentUid, requestUid] = getForCancel(response.config);
      cancelableRequests[componentUid][requestUid] = null;
    }
    return Promise.resolve(response);
  },
  (error) => {
    if (error.config && error.config.forCancel) {
      const [componentUid, requestUid] = getForCancel(error.config);
      cancelableRequests[componentUid][requestUid] = null;
    }
    return Promise.reject(error);
  }
);

/**
 * Функция для инициализации отменяемых запросов компонента
 * 
 * @param {string} componentUid - уникальный идентификатор компонента
 * 
 * @returns {[ string ]}
 */
export function registerComponent(componentUid) {
  // if (addRandom) {
  //   componentUid = `${componentUid}|${Math.random()}`;
  // }
  cancelableRequests[componentUid] = {};
  // return [componentUid, cancelableRequests[componentUid]];
  return componentUid;
}

/**
 * Отменяет запрос компонента
 * 
 * @param {string} componentUid - уникальный идентификатор компонента
 * @param {string} requestUid - уникальный идентификатор запроса
 */
export function cancelRequest(componentUid, requestUid) {
  const canceller = cancelableRequests[componentUid][requestUid];
  try {
    canceller();
  } catch(Error) {
    // Если отменялка была, но что-то пошло не так
    if (canceller) {
      console.log('Error while cancelling request with ' +
        `componentUid[${componentUid}] and requestUid[${requestUid}]: ${Error}`);
    }
  } finally {
    cancelableRequests[componentUid][requestUid] = null;
  }
}

/**
 * Отменяет все запросы компонента
 * 
 * @param {string} componentUid - уникальный идентификатор компонента
 */
export function cancelAllComponentRequests(componentUid) {
  for (const requestUid in cancelableRequests[componentUid]) {
    cancelRequest(componentUid, requestUid);
  }
}

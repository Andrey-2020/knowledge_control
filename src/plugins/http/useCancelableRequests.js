import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  registerComponent,
  cancelAllComponentRequests,
  cancelRequest,
} from 'plugins/http/cancelableRequests';

/**
 * Хук для создания объекта, который будет хранить "отменялки" запросов компонента.
 * Автоматически отменяет все зарегистрированные запросы компонента перед его удалением
 * 
 * @param {string} componentUid - уникальный идентификатор компонента
 * @param {boolean} addRandom - Добавляет Math.random() к названию, чтобы сделать его уникальным
 * 
 * @returns {[
 *   componentUid: string,
 *   cancelRequest: (requestUid: string) => void,
 * ]} Uid компонента и функция для отмены запросов
 */
export default function useCancelableRequests(componentUid, addRandom=false) {
  /** Отменяет все зарегистрированные запросы компонента перед его удалением */
  useEffect(() => {
    return () => cancelAllComponentRequests(componentUid);
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
  return [
    /** Единоразово регистрирует компонент и возвращет его имя */
    useState(() => registerComponent(componentUid + (addRandom ? String(Math.random()) : '')))[0],
    /** Функция для отмены запросов */
    
    useCallback((requestUid) => {
      cancelRequest(componentUid, requestUid);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []),
  ];
}

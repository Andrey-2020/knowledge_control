import { useState, useEffect } from 'react';

/**
 * Реализация паттерна "Шина событий"
 */
class EventBus {
  constructor() {
    /** @type {{ [eventId: string]: import('.').EventCallback[] }} */
    this.listeners = {};
  }

  /**
   * Подписка на событие
   * 
   * @param {string} eventId 
   * @param {import('.').EventCallback} callback 
   */
  on(eventId, callback) {
    if (eventId in this.listeners) {
      this.listeners[eventId].push(callback);
    } else {
      this.listeners[eventId] = [callback];
    }
  }

  /**
   * Отмена подписок на события
   * 
   * @param {?string} eventId 
   * @param {?import('.').EventCallback} callback 
   */
  off(eventId=null, callback=null) {
    if (!eventId) {
      this.listeners = {};
    } else if (!callback) {
      delete this.listeners[eventId];
    } else {
      this.listeners[eventId].splice(this.listeners[eventId].indexOf(callback), 1);
    }
  }

  /**
   * Запуски события по eventId
   * 
   * @param {string} eventId 
   * @param {any[]} args 
   */
  emit(eventId, ...args) {
    if (eventId in this.listeners) {
      for (const callback of this.listeners[eventId]) {
        callback(...args);
      }
    }
  }
}

const eventBus = new EventBus();

export default eventBus;

/**
 * Хук для использование шины событий в React
 * 
 * @param {string} eventId
 * @param {import('.').EventCallback} callback
 */
export function useEventBusListener(eventId, callback) {
  const [_callback, set_Callback] = useState(() => {
    eventBus.on(eventId, callback);
    return callback;
  });
  if (_callback !== callback) {
    set_Callback(callback);
    eventBus.on(eventId, callback);
  }

  useEffect(() => {
    return () => { eventBus.off(eventId, _callback); };
  }, [eventId, _callback]);
}

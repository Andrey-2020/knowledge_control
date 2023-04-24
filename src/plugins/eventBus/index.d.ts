export interface EventCallback {
  (args: Any[]): void;
}
/**
 * Реализация паттерна "Шина событий"
 */
export class EventBus {
  public listeners: {
    [eventId: string]: EventCallback[],
  };

  /**
   * Подписка на событие
   */
  on(
    eventId: string,
    callback: EventCallback,
  );

  /**
   * Отмена подписок на события
   * 
   * @param {?string} eventId 
   * @param {?EventCallback} callback 
   */
  off(
    eventId?: string,
    callback?: EventCallback,
  );

  /**
   * Запуски события по eventId
   */
  emit(
    eventId: string,
    ...args: any[],
  );
}

export default new EventBus();

/**
 * Хук для использование шины событий в React
 */
export function useEventBusListener(
  eventId: string,
  callback: EventCallback,
);

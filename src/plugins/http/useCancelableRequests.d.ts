export function selfCancelRequest(requestUid: string): void;

/**
 * Хук для создания объекта, который будет хранить "отменялки" запросов компонента.
 * Автоматически отменяет все зарегистрированные запросы компонента перед его удалением
 * 
 * @param componentUid - уникальный идентификатор компонента
 * @param addRandom - Добавляет Math.random() к названию, чтобы сделать его уникальным
 * 
 * @returns Uid компонента и функция для отмены запросов
 */
export default function useCancelableRequests(
  componentUid: string,
  addRandom?: boolean,
): [
  componentUid: string,
  cancelRequest: typeof selfCancelRequest,
];
export interface CancelableRequestsObject {
  componentUid: string,
  cancelRequest: typeof selfCancelRequest,
}

/**
 * Обёртка функции, автоматически использующая event.stopPropagation
 * 
 * @param {(event: Event, ...args: any[]) => void} func
 * @returns {(event: Event, ...args: any[]) => void}
 */
export default function eventStop(
  func: (event: Event, ...args: any[]) => void,
): (event: Event, ...args: any[]) => void;

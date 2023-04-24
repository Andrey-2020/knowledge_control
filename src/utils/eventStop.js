/**
 * Обёртка функции, автоматически использующая event.stopPropagation
 * 
 * @param {(event: Event, ...args: any[]) => void} func
 * @returns {(event: Event, ...args: any[]) => void}
 */
export default function eventStop(func) {
  return function(event, ...args) {
    event.stopPropagation();
    func(event, ...args);
  }
}

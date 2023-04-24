/**
 * Очищает объект
 * 
 * @param {{}} target
 * @returns {void}
 */
export default function ObjectClear(target) {
  for (const key in target) {
    delete target[key];
  }
}

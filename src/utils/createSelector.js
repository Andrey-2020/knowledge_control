/**
 * @template T
 * @param {T[]} array
 * @param {keyof T} selectorKey
 * 
 * @returns {{ [selectorKey: string]: T }}
 */
export default function createSelector(array, selectorKey) {
  const result = {};
  for (const element of array) {
    result[element[selectorKey]] = element;
  }
  return result;
}

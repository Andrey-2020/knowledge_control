/**
 * array.filter + array.map
 * 
 * @template OldT, NewT
 * @param {OldT[]} array
 * @param {(value: OldT, index: number, array: OldT[]) => boolean} filterFunction
 * @param {(value: OldT, index: number, array: OldT[]) => NewT} mapFunction
 * 
 * @returns {NewT[]}
 */
export default function filterMap(array, filterFunction, mapFunction) {
  const result = [];
  for (let index = 0; index < array.length; index++) {
    if (filterFunction(array[index], index, array)) {
      result.push(mapFunction(array[index], index, array));
    }
  }
  return result;
}

/**
 * array.filter + array.map
 */
export default function filterMap<OldT, NewT>(
  array: OldT[],
  filterFunction: (value: OldT, index: number, array: OldT[]) => boolean,
  mapFunction: (value: OldT, index: number, array: OldT[]) => NewT,
): NewT[];

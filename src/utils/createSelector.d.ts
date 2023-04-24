export interface Selector<T extends Object, K extends keyof T> {
  [selectorKey: T[K]]: T;
}

export default function createSelector<T extends object, K extends keyof T>(
  array: T[],
  selectorKey: K,
): Selector<T, K>;

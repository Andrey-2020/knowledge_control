import { Options } from 'CommonTypes';


/**
 * 
 */
export default function createOptions<T extends object>(
  array: T[],
  valueKey: keyof T,
  labelKey: keyof T,
): Options<T[valueKey]>;

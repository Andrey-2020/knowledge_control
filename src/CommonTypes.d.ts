import { Rule } from 'rc-field-form/lib/interface';
export { Rule } from 'rc-field-form/lib/interface';

export interface Option<T> {
  value: T,
  label: string,
}

export declare type Options<T> = Option<T>[];

export interface FormRules {
  [fieldName: string]: Rule[],
}

export interface ArrayFixedLength<Type, Length> extends Array<Type> {
  length: Length,
}

import {
  makeAutoObservable,
  observable,
} from 'mobx';
import { Moment } from 'moment';


export class SettedState<T> {
  value: T;

  constructor(
    initialValue: T,
    ref: boolean = false,
  );

  set(value: T): void;
}

export class BooleanState {
  value: boolean;

  constructor(initialValue: boolean);

  set(value: boolean): void;
  setTrue(): void;
  setFalse(): void;
  toggle(): void;
}


export interface ValueParser<T> {
  (value: T | any): T;
}

export class AsyncState<T> {
  value: T;
  _initialValue: T;
  _promise: Promise<T>;
  _promiseEnded: boolean;
  _getValuePromiseFunction: () => Promise<(T | any)>;
  _valueParser: ValueParser<T>;

  constructor(
    initialValue: (T | any),
    getValuePromiseFunction: () => Promise<(T | any)>,
    valueParser: ValueParser,
  );

  _setPromiseEndedFalse(): void;

  _returnAndSetParsedValue(value: T | any): T;

  _get(): Promise<T>;

  get(): Promise<T>;

  getForce(): Promise<T>;
}

export class DateState {
  _object: Moment;

  _string: string;
  _stringFormat: string;

  _year: number;
  /** Квартал, четверть */
  _quarter: number;
  _month: number;
  /** Неделя в году */
  _week: number;
  /** День в неделе */
  _day: number;
  /** День в году */
  _date: number;
  _hourL: number;
  _minute: number;
  _second: number;
  _millisecond: number;

  constructor(initialDate: Moment);

  get string(): string;
  set string(value): void;

  get stringFormat(): string;
  set stringFormat(value): void;

  get year(): number;
  set year(value): void;

  get quarter(): number;
  set quarter(value): void;

  get month(): number;
  set month(value): void;

  get week(): number;
  set week(value): void;

  get day(): number;
  set day(value): void;

  get date(): number;
  set date(value): void;

  get hour(): number;
  set hour(value): void;

  get minute(): number;
  set minute(value): void;

  get second(): number;
  set second(value): void;

  get millisecond(): number;
  set millisecond(value): void;

  _resetFields(): void;

  setDateObject(dataObject: Moment): void;

  asMoment(): Moment;
}

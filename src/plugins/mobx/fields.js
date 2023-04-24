import {
  makeAutoObservable,
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import moment from 'moment';


/** @template T */
export class SettedState {
  /** @type {T} */
  value;

  /**
   * @param {T} initialValue
   * @param {boolean} [ref=false] false default
   */
  constructor(initialValue, ref) {
    this.value = initialValue;

    makeAutoObservable(this, {
      value: !ref ? true : observable.ref,
    }, { autoBind: true });
  }

  /** @param {T} value */
  set(value) {
    this.value = value;
  }
}


export class BooleanState {
  /** @type {boolean} */
  value;

  /** @param {boolean} initialValue */
  constructor(initialValue) {
    this.value = initialValue;

    makeAutoObservable(this, {}, { autoBind: true });
  }

  /** @param {boolean} value */
  set(value) {
    this.value = Boolean(value);
  }

  setTrue() {
    this.value = true;
  }

  setFalse() {
    this.value = false;
  }

  toggle() {
    this.value = !this.value;
  }
}


/**
 * @template T
 * @param {(T | any)} value
 * @returns {T}
 */
function returnValue(value) {
  return value;
}

/** @template T */
export class AsyncState {
  /** @type {T} */
  value;
  /** @type {Promise<T>} */
  _promise = null;
  /** @type {boolean} */
  _promiseEnded = true;

  /**
   * @param {(T | any)} initialValue
   * @param {() => Promise<(T | any)>} getValuePromiseFunction
   * @param {(import('./fields').ValueParser} [valueParser]
   */
  constructor(initialValue, getValuePromiseFunction, valueParser) {
    this.value = initialValue;
    this._getValuePromiseFunction = getValuePromiseFunction;
    this._valueParser = valueParser || returnValue;

    makeObservable(this, {
      value: observable,
      _setPromiseEndedFalse: action.bound,
      _returnAndSetParsedValue: action.bound,
      _get: action,
      get: action.bound,
      getForce: action.bound,
    });
    // Чтобы после создания реактивности был указатель на один и тот же объект
    this._initialValue = this.value;
  }

  _setPromiseEndedFalse() {
    this._promiseEnded = false;
  }

  /**
   * @param {(T | any)}
   * @returns {T}
   */
  _returnAndSetParsedValue(value) {
    value = this._valueParser(value);
    this.value = value;
    return this.value;
  }

  _get() {
    this._promiseEnded = false;
    const promise = this._getValuePromiseFunction()
    .then(this._returnAndSetParsedValue)
    .finally(this._setPromiseEndedFalse);
    this._promise = promise;
    return promise;
  }

  get() {
    if (!this._promiseEnded) {
      return this._promise;
    }
    if (this.value !== this._initialValue) {
      return Promise.resolve(this.value);
    }
    return this._get();
  }

  getForce() {
    if (!this._promiseEnded) {
      return new Promise((resolve) => {
        this._promise.finally(() => {
          resolve(this._get());
        })
      });
    }
    return this._get();
  }
}

const dateFields = [
  'year',
  'quarter',
  'month',
  'week',
  'day',
  'date',
  'hour',
  'minute',
  'second',
  'millisecond',
];
const dateStateFields = dateFields.map((field) => `_${field}`);
export class DateState {
  /** @type {import('moment').Moment} */
  _object;
  /** @type {string} */
  _string;
  /** @type {string} */
  _stringFormat;

  /** @type {number} */
  _year;
  /**
   * Квартал, четверть
   * @type {number}
   */
  _quarter;
  /** @type {number} */
  _month;
  /**
   * Неделя в году
   * @type {number}
   */
  _week;
  /**
   * День в неделе
   * @type {number}
   */
  _day;
  /**
   * День в году
   * @type {number}
   */
  _date;
  /** @type {number} */
  _hour;
  /** @type {number} */
  _minute;
  /** @type {number} */
  _second;
  /** @type {number} */
  _millisecond;

  /**
   * @param {import('moment').Moment} initialDate
   * @param {string} format
   */
  constructor(initialDate) {
    this.setDateObject(initialDate || moment());

    makeObservable(this, {
      _string: observable,
      _year: observable,
      _quarter: observable,
      _month: observable,
      _week: observable,
      _day: observable,
      _date: observable,
      _hour: observable,
      _minute: observable,
      _second: observable,
      _millisecond: observable,
      string: computed,
      stringFormat: computed,
      year: computed,
      quarter: computed,
      month: computed,
      week: computed,
      day: computed,
      date: computed,
      hour: computed,
      minute: computed,
      second: computed,
      millisecond: computed,
      _resetFields: action,
    });
  }

  get string() {
    return this._string;
  }
  set string(value) {
    this._object = moment(value, this._stringFormat, true);
    this._resetFields();
  }

  get stringFormat() {
    return this._stringFormat;
  }
  set stringFormat(value) {
    this._stringFormat = value;
    this._string = this._object.format(this._stringFormat);
  }

  get year() {
    return this._year;
  }
  set year(value) {
    this._object.year(value);
    this._resetFields();
  }

  get quarter() {
    return this._quarter;
  }
  set quarter(value) {
    this._object.quarter(value);
    this._resetFields();
  }

  get month() {
    return this._month;
  }
  set month(value) {
    this._object.month(value);
    this._resetFields();
  }

  get week() {
    return this._week;
  }
  set week(value) {
    this._object.week(value);
    this._resetFields();
  }

  get day() {
    return this._day;
  }
  set day(value) {
    this._object.day(value);
    this._resetFields();
  }

  get date() {
    return this._date;
  }
  set date(value) {
    this._object.date(value);
    this._resetFields();
  }

  get hour() {
    return this._hour;
  }
  set hour(value) {
    this._object.hour(value);
    this._resetFields();
  }

  get minute() {
    return this._minute;
  }
  set minute(value) {
    this._object.minute(value);
    this._resetFields();
  }

  get second() {
    return this._second;
  }
  set second(value) {
    this._object.second(value);
    this._resetFields();
  }

  get millisecond() {
    return this._millisecond;
  }
  set millisecond(value) {
    this._object.millisecond(value);
    this._resetFields();
  }

  _resetFields() {
    for (let i = 0; i < dateStateFields.length; i++) {
      this[dateStateFields[i]] = this._object[dateFields[i]]();
    }
    this._string = this._object.format(this._stringFormat);
  }

  /** @param {import('moment').Moment} dateObject */
  setDateObject(dateObject) {
    if (!dateObject || (dateObject && !moment.isMoment(dateObject))) {
      throw new TypeError(
        'Invalid type "initialDate", expected "Moment", got ' +
        `"${typeof dateObject}" with value "${dateObject}"`);
    }
    this._object = dateObject;
    this._resetFields();
  }

  asMoment() {
    return this._object.clone();
  }
}

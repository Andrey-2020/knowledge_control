import i18n from 'i18next';

/**
 * Enum ролей пользователей
 *questionTypeTranslatorOptions
 * @readonly
 * @enum {string}
 */
export const ROLES = {
  USER: 'USER',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
};
export const ANY_ROLES = Object.values(ROLES);

/**
 * Перевод Enum ролей пользователей
 *
 * @param {ROLES} role
 * @returns {string}
 */
export function roleTranslator(role) {
  return i18n.t(`globalStore.constants:ROLES.${role}`);
};

/**
 * Перевод Enum ролей пользователей в виде массива { value, label }
 *
 * @returns {import('CommonTypes').Options<string>}
 */
export function roleTranslatorOptions() {
  return Object.values(ROLES).map((value) => ({
    value,
    label: roleTranslator(value),
  }));
};

/**
 * Enum типа зачётности по предмету
 *
 * @readonly
 * @enum {string}
 */
export const CONTROL_TYPES = {
  EXAM: 'EXAM',
  CREDIT: 'CREDIT',
  DIFFERENTIAL_CREDIT: 'DIFFERENTIAL_CREDIT',
};

/**
 * Перевод Enum типа зачётности по предмету
 *
 * @param {CONTROL_TYPES} controlType
 * @returns {string}
 */
export function controlTypeTranslator(controlType) {
  console.log(controlType)
  console.log(`globalStore.constants:CONTROL_TYPES.${controlType}`)
  return i18n.t(`globalStore.constants:CONTROL_TYPES.${controlType}`);
};

/**
 * Перевод Enum ролей пользователей в виде массива { value, label }
 *
 * @returns {import('CommonTypes').Options<string>}
 */
export function controlTypeTranslatorOptions() {
  return Object.values(CONTROL_TYPES).map((value) => ({
    value,
    label: controlTypeTranslator(value),
  }));
};

export const COURSE_NUMBERS_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
];

/**
 * Enum типов вопросов
 *
 * @readonly
 * @enum {string}
 */
export const QUESTIONS_TYPES = {
  SELECT: 'SELECT',
  WRITE: 'WRITE',
  SEQUENCE: 'SEQUENCE',
  MATCH: 'MATCH',
};

/**
 * Перевод Enum типа вопросов
 *
 * @param {QUESTIONS_TYPES} questionType
 * @returns {string}
 */
export function questionTypeTranslator(questionType) {
  return i18n.t(`globalStore.constants:QUESTIONS_TYPES.${questionType}`);
 };

/**
 * Перевод Enum вопросов в виде массива { value, label }
 *
 * @returns {import('CommonTypes').Options<string>}
 */
export function questionTypeTranslatorOptions() {
  return Object.values(QUESTIONS_TYPES).map((value) => ({
    value,
    label: questionTypeTranslator(value),
  }));
};

/**
 * Enum типов заданий
 *
 * @readonly
 * @enum {string}
 */
export const TASK_TYPES = {
  LAB: 'LAB',
  PRACTICE: 'PRACTICE',
  COURSEWORK: 'COURSEWORK',
  ESSAY: 'ESSAY',
};

/**
 * Перевод Enum типа заданий
 *
 * @param {TASK_TYPES} taskType
 * @returns {string}
 */
export function taskTypeTranslator(taskType) {
  return i18n.t(`globalStore.constants:TASK_TYPES.${taskType}`);
};

/**
 * Перевод Enum заданий в виде массива { value, label }
 *
 * @returns {import('CommonTypes').Options<string>}
 */
export function taskTypeTranslatorOptions() {
  return Object.values(TASK_TYPES).map((value) => ({
    value,
    label: taskTypeTranslator(value),
  }));
};

/**
 * Enum оценок
 *
 * @readonly
 * @enum {string}
 */
export const MARK_TYPES = {
  FIVE: 'FIVE',
  FOUR: 'FOUR',
  THREE: 'THREE',
  UNSATISFACTORILY: 'UNSATISFACTORILY',
  NOT_PASSED: 'NOT_PASSED',
  PASSED: 'PASSED',
};

/**
 * Перевод Enum типа оценок
 *
 * @param {MARK_TYPES} markType
 * @returns {string}
 */
export function markTypeTranslator(markType) {
  return i18n.t(`globalStore.constants:MARK_TYPES.${markType}`);
};

/**
 * Перевод Enum оценок в виде массива { value, label }
 *
 * @returns {import('CommonTypes').Options<string>}
 */
export function markTypeTranslatorOptions() {
  return Object.values(MARK_TYPES).map((value) => ({
    value,
    label: markTypeTranslator(value),
  }));
};

export const MARK_TYPE_DISAPPOINTINGLY = 'DISAPPOINTINGLY';

/**
 * Перевод Enum оценок в виде массива { value, label }
 *
 * @returns {import('CommonTypes').Options<string>}
 */
export function markTypeTranslatorOptionsExtended() {
  return Object.values({
    ...MARK_TYPES,
    [MARK_TYPE_DISAPPOINTINGLY]: MARK_TYPE_DISAPPOINTINGLY,
  }).map((value) => ({
    value,
    label: markTypeTranslator(value),
  }));
};


/**
 * Enum состояний авторизации
 *
 * @readonly
 * @enum {string}
 */
export const AUTHORIZATION_STATE = {
  REQUIRED: 'REQUIRED',
  WITHOUT: 'WITHOUT',
  BOTH: 'BOTH',
};

/**
 * Enum типа литературы
 *
 * @readonly
 * @enum {string}
 */
export const LITERATURE_TYPES = {
  BOOK: 'BOOK',
  WORKBOOK: 'WORKBOOK',
};

/**
 * Перевод Enum типа оценок
 *
 * @param {LITERATURE_TYPES} literatureType
 * @returns {string}
 */
export function literatureTypeTranslator(literatureType) {
  return i18n.t(`globalStore.constants:LITERATURE_TYPES.${literatureType}`);
};

/**
 * Enum типа контактов пользователя
 *
 * @readonly
 * @enum {string}
 */
export const USER_CONTACT_TYPES = {
  EMAIL: 'EMAIL',
  TELEGRAM: 'TELEGRAM',
  VKONTAKTE: 'VKONTAKTE',
};

/**
 * Перевод Enum контактов пользователя
 *
 * @param {USER_CONTACT_TYPES} type
 * @returns {string}
 */
export function userContactTypeTranslator(type) {
  return i18n.t(`globalStore.constants:USER_CONTACT_TYPES.${type}`);
};

/**
 * Перевод Enum оценок в виде массива { value, label }
 *
 * @returns {import('CommonTypes').Options<string>}
 */
export function userContactTypeTranslatorOptions() {
  return Object.values(USER_CONTACT_TYPES).map((value) => ({
    value,
    label: userContactTypeTranslator(value),
  }));
};

export const JOURNAL_DATE_FORMAT = 'DD MMMM YYYY';

import {
  Rule,
  ValidatorRule,
} from 'rc-field-form/lib/interface';
import { FormInstance } from 'antd/lib/form';

/**
 * Создание правила обязательного поля
 */
export function createRequired(message: string): Rule;

/**
 * Правила для полей, компоненты должны быть observer'ами из mobx-react
 */
export declare const required = {
  default: createRequired('Поле обязательно'),
  firstName: createRequired(i18n.t('utils.formRules:required.firstName')),
  lastName: createRequired(i18n.t('utils.formRules:required.lastName')),
  patronymic: createRequired(i18n.t('utils.formRules:required.patronymic')),
  login: createRequired(i18n.t('utils.formRules:required.login')),
  password: createRequired(i18n.t('utils.formRules:required.password')),
  email: createRequired(i18n.t('utils.formRules:required.email')),
  shortName: createRequired(i18n.t('utils.formRules:required.shortName')),
  fullName: createRequired(i18n.t('utils.formRules:required.fullName')),
  code: createRequired(i18n.t('utils.formRules:required.code')),
  groupNumber: createRequired(i18n.t('utils.formRules:required.groupNumber')),
  numberOfSemester: createRequired(i18n.t('utils.formRules:required.numberOfSemester')),
  yearOfStudyStart: createRequired(i18n.t('utils.formRules:required.yearOfStudyStart')),
  departmentId: createRequired(i18n.t('utils.formRules:required.departmentId')),
  name: createRequired(i18n.t('utils.formRules:required.name')),
  decryption: createRequired(i18n.t('utils.formRules:required.decryption')),
  controlType: createRequired(i18n.t('utils.formRules:required.controlType')),
  studyGroupId: createRequired(i18n.t('utils.formRules:required.studyGroupId')),
  studyGroupIds: {
    ...createRequired(i18n.t('utils.formRules:required.studyGroupIds')),
    type: 'array',
  },
  phone: createRequired(i18n.t('utils.formRules:required.phone')),
  type: createRequired(i18n.t('utils.formRules:required.type')),
};
export declare const valid = {
  email: {
    type: 'email',
    message: i18n.t('utils.formRules:valid.email'),
  },
};
export declare const maxLength = {
  standard: {
    max: 255,
    message: i18n.t('utils.formRules:maxLength.email'),
  },
};

/**
 * При "трогании" поля будет срабатывать валидация полей\
 */
export function createTriggerValidate(
  form: FormInstance,
  fields: string[],
): ValidatorRule;

/**
 * При "трогании" поля будет проверяться сопадение значения с полем
 */
export function createEqualCheck(
  form: FormInstance,
  field: string,
  message: string,
): ValidatorRule;

import i18n from 'i18next';
import {
  observable,
  reaction,
} from 'mobx';

import store from 'globalStore';


/**
 * Создание правила обязательного поля
 * 
 * @param {string} message 
 * @returns {import("rc-field-form/lib/interface").Rule}
 */
export function createRequired(message) {
  return {
    required: true,
    message,
  };
}

export const required = observable({
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
});
export const valid = observable({
  email: {
    type: 'email',
    message: i18n.t('utils.formRules:valid.email'),
  },
});
export const maxLength = observable({
  standard: {
    max: 255,
    message: i18n.t('utils.formRules:maxLength.email'),
  },
});

const toTranslated = {
  required,
  valid,
  maxLength,
};
/**
 * Перевод.
 * setTimeout для фикса ошибки undefined store
 */
setTimeout(() => {
  reaction(
    () => store.Internationalization.locale,
    () => {
      for (const [name, object] of Object.entries(toTranslated)) {
        for (const key in object) {
          object[key].message = i18n.t(`utils.formRules:${name}.${key}`);
        }
      }
    }
  );
});

/**
 * При "трогании" поля будет срабатывать валидация полей
 * 
 * @param {import("antd/lib/form").FormInstance} form
 * @param {string[]} fields
 * @returns {import("rc-field-form/lib/interface").ValidatorRule}
 */
export function createTriggerValidate(form, fields) {
  return {
    validator() {
      for (const field of fields) {
        if (form.isFieldsTouched([field])) {
          setTimeout(() => {
            form.validateFields([field]);
          });
        }
      }
      return Promise.resolve();
    },
  };
}

/**
 * При "трогании" поля будет проверяться сопадение значения с полем
 * 
 * @param {import("antd/lib/form").FormInstance} form
 * @param {string} field
 * @param {string} message
 * @returns {import("rc-field-form/lib/interface").ValidatorRule}
 */
export function createEqualCheck(form, field, message) {
  return {
    validator(_, value) {
      if (value !== form.getFieldValue(field)) {
        return Promise.reject(message);
      } else {
        return Promise.resolve();
      }
    },
  }
}

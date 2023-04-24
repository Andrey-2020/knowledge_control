import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Select,
  Spin,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';

import {
  required,
  valid,
  createTriggerValidate,
  createEqualCheck,
  maxLength,
} from 'utils/formRules';
import http from 'plugins/http';
import {
  ROLES,
  roleTranslatorOptions,
} from 'globalStore/constants';
import useOnce from 'utils/useOnce';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<import('./AddUserModalButton')>} */
class State extends BaseState {
  rules = {
    login: [
      required.login,
      maxLength.standard,
    ],
    password: [
      required.password,
      maxLength.standard,
    ],
    repeatedPassword: [
      required.password,
      maxLength.standard,
    ],
    email: [
      required.email,
      valid.email,
      maxLength.standard,
    ],
    firstName: [
      required.firstName,
      maxLength.standard,
    ],
    lastName: [
      required.lastName,
      maxLength.standard,
    ],
    patronymic: [maxLength.standard],
    phone: [
      required.phone,
      maxLength.standard,
    ],
    studyGroupId: [required.studyGroupId],
    departmentId: [required.departmentId],
    role: [],
  };
  visible = new BooleanState(false);
  loading = new BooleanState(false);
  userRole = new SettedState(ROLES.USER);

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      userAffiliationFieldComponent: computed,
      addFormRules: action.bound,
      add: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get userAffiliationFieldComponent() {
    if (this.userRole.value === ROLES.USER) {
      return (
        <Form.Item
          name="studyGroupId"
          label={i18n.t('pages.Administration.Users.AddUserModalButton:template.Form.studyGroupId--label')}
          rules={this.rules.studyGroupId}
        >
          <Select
            placeholder={i18n.t('pages.Administration.Users.AddUserModalButton:template.Form.studyGroupId--placeholder')}
            options={this.props.studyGroupsOptions}
          />
        </Form.Item>
      );
    }
    if (this.userRole.value === ROLES.TEACHER) {
      return (
        <Form.Item
          name="departmentId"
          label={i18n.t('pages.Administration.Users.AddUserModalButton:template.Form.departmentId--label')}
          rules={this.rules.departmentId}
        >
          <Select
            placeholder={i18n.t('pages.Administration.Users.AddUserModalButton:template.Form.departmentId--placeholder')}
            options={this.props.departmentsOptions}
          />
        </Form.Item>
      );
    }
    return null; 
  }

  addFormRules() {
    /** Они должны ставится на последнее место в массивах */
    this.rules.repeatedPassword.push(createEqualCheck(
      this.formInstance,
      'password',
      i18n.t('utils.formRules:equalCheck.repeatedPassword'),
    ));
    this.rules.password.push(createTriggerValidate(
      this.formInstance,
      ['repeatedPassword'],
    ));
  }

  /**
   * @param {import('./AddUserModalButton').FormData} formData
   */
  add(formData) {
    this.loading.value = true;
    delete formData.repeatedPassword;
    http.post('/registration', formData, {
      // Временно, попросить сделать нормально
      headers: { token: http.defaults.headers[http.authTokenName] },
    })
    .then(() => {
      this.visible.setFalse();
      this.props.onAdd();
      message.success(i18n.t('pages.Administration.Users.AddUserModalButton:add--success'), 3);
      this.formInstance.resetFields();
    })
    .catch((error) => {
      message.error(http.parseError(
        i18n.t('pages.Administration.Users.AddUserModalButton:add--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/**
 * Модальное окно регистрации нового пользователя
 * 
 * @param {import('./AddUserModalButton').Props} props
 */
function AddUserModalButton(props) {
  const { t } = useTranslation(
    'pages.Administration.Users.AddUserModalButton',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
  state.props = props;
  state.formInstance = Form.useForm()[0];
  useOnce(state.addFormRules);

  return (
    <>
      <Button
        type="primary"
        onClick={state.visible.setTrue}
      >
        {t('template.show-button--text')}
      </Button>
      <Modal
        footer={null}
        visible={state.visible.value}
        title={t('template.Modal--title')}
        onOk={state.visible.setFalse}
        onCancel={state.visible.setFalse}
      >
        <Spin spinning={state.loading.value}>
          <Form
            layout="vertical"
            form={state.formInstance}
            onFinish={state.add}
          >
            <Form.Item
              name="login"
              label={t('template.Form.login--label')}
              rules={state.rules.login}
            >
              <Input placeholder={t('template.Form.login--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="password"
              label={t('template.Form.password--label')}
              rules={state.rules.password}
            >
              <Input.Password placeholder={t('template.Form.password--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="repeatedPassword"
              label={t('template.Form.repeatedPassword--label')}
              rules={state.rules.repeatedPassword}
            >
              <Input.Password placeholder={t('template.Form.repeatedPassword--label')}/>
            </Form.Item>
            <Form.Item
              name="email"
              label={t('template.Form.email--label')}
              rules={state.rules.email}
            >
              <Input placeholder={t('template.Form.email--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="firstName"
              label={t('template.Form.firstName--label')}
              rules={state.rules.firstName}
            >
              <Input placeholder={t('template.Form.firstName--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="lastName"
              label={t('template.Form.lastName--label')}
              rules={state.rules.lastName}
            >
              <Input placeholder={t('template.Form.lastName--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="patronymic"
              label={t('template.Form.patronymic--label')}
              rules={state.rules.patronymic}
            >
              <Input placeholder={t('template.Form.patronymic--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="phone"
              label={t('template.Form.phone--label')}
              rules={state.rules.phone}
            >
              <Input placeholder={t('template.Form.phone--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="role"
              label={t('template.Form.role--label')}
              rules={state.rules.role}
              initialValue={ROLES.USER}
            >
              <Select
                placeholder={t('template.Form.role--placeholder')}
                options={roleTranslatorOptions()}
                onChange={state.userRole.set}
              />
            </Form.Item>
            {state.userAffiliationFieldComponent}
            <Button
              className="w-100"
              size="large"
              type="primary"
              htmlType="submit"
            >
              {t('template.Form.submit--text')}
            </Button>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}

export default observer(AddUserModalButton);

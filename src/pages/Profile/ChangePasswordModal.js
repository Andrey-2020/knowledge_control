import React, { useState } from 'react';
import {
  Button,
  Modal,
  Spin,
  Form,
  message,
  Input,
} from 'antd';
import { observer } from 'mobx-react';
import {
  makeObservable,
  observable,
  action,
} from 'mobx';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import useOnce from 'utils/useOnce';
import { BooleanState } from 'plugins/mobx/fields';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import {
  required,
  createTriggerValidate,
  createEqualCheck,
  maxLength,
} from 'utils/formRules';
import http from 'plugins/http';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<undefined>} */
class State extends BaseState {
  visible = new BooleanState(false);
  loading = new BooleanState(false);
  /** @see addRules for null */
  rules = {
    newPassword: [
      required.password,
      maxLength.standard,
      null,
    ],
    repeatedNewPassword: [
      required.password,
      maxLength.standard,
      null,
    ],
  };

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      addRules: action.bound,
      changePassword: action.bound,
    });
  }

  static create() {
    return new State();
  }

  addRules() {
    this.rules.newPassword[2] = createTriggerValidate(
      this.formInstance,
      ['repeatedNewPassword'],
    );
    this.rules.repeatedNewPassword[2] = createEqualCheck(
      this.formInstance,
      'newPassword',
      i18n.t('utils.formRules:equalCheck.repeatedPassword'),
    );
  }

  /** @param {import('./ChangePasswordModal').FormData} formData */
  changePassword(formData) {
    this.loading.value = true;

    http.patch('/user', { password: formData.newPassword })
    .then(() => {
      this.visible.setFalse();
      message.success(i18n.t('pages.Profile.ChangePasswordModal:changePassword--success'), 3);
      this.formInstance.resetFields();
    })
    .catch((error) => {
      createDecoratedErrorMessage(http.parseError(
        i18n.t('pages.Profile.ChangePasswordModal:changePassword--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/**
 * Модальное окно изменения пароля
 */
function ChangePasswordModal() {
  const { t } = useTranslation(
    'pages.Profile.ChangePasswordModal',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
  state.formInstance = Form.useForm()[0];
  useOnce(state.addRules);

  return (
    <>
      <Button onClick={state.visible.setTrue}>
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
            onFinish={state.changePassword}
          >
            <Form.Item
              name="newPassword"
              label={t('template.Form.newPassword--label')}
              rules={state.rules.newPassword}
            >
              <Input.Password placeholder={t('template.Form.newPassword--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="repeatedNewPassword"
              label={t('template.Form.repeatedNewPassword--label')}
              rules={state.rules.repeatedNewPassword}
            >
              <Input.Password placeholder={t('template.Form.repeatedNewPassword--placeholder')}/>
            </Form.Item>
            <Button
              className="w-100"
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
export default observer(ChangePasswordModal);

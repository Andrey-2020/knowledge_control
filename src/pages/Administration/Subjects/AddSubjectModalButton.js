import React, { useState } from 'react';
import {
  Spin,
  Modal,
  Form,
  Input,
  Button,
  message,
  Select,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  makeObservable,
  observable,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';

import {
  required,
  maxLength,
} from 'utils/formRules';
import http from 'plugins/http';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<import('./AddSubjectModalButton').Props>} */
class State extends BaseState {
  rules = {
    name: [
      required.name,
      maxLength.standard,
    ],
    decryption: [
      required.decryption,
      maxLength.standard,
    ],
    departmentId: [],
  };
  visible = new BooleanState(false);
  loading = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      add: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /**
   * @param {import('./AddSubjectModalButton').FormData} formData
   */
  add(formData) {
    this.loading.value = true;
    http.post('/subject', formData)
    .then(() => {
      this.visible.setFalse();
      this.props.onAdd();
      message.success(i18n.t('pages.Administration.Subjects.AddSubjectModalButton:add--success'), 3);
      this.formInstance.resetFields();
    })
    .catch((error) => {
      message.error(http.parseError(
        i18n.t('pages.Administration.Subjects.AddSubjectModalButton:add--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/**
 * Модальное окно добавления факультета
 * 
 * @param {import('./AddSubjectModalButton').Props} props
 */
function AddSubjectModalButton(props) {
  const { t } = useTranslation(
    'pages.Administration.Subjects.AddSubjectModalButton',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
  state.props = props;
  state.formInstance = Form.useForm()[0];

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
              name="name"
              label={t('template.Form.name--label')}
              rules={state.rules.name}
            >
              <Input placeholder={t('template.Form.name--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="decryption"
              label={t('template.Form.decryption--label')}
              rules={state.rules.decryption}
            >
              <Input placeholder={t('template.Form.decryption--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="departmentId"
              label={t('template.Form.departmentId--label')}
              rules={state.rules.departmentId}
            >
              <Select
                allowClear
                placeholder={t('template.Form.departmentId--placeholder')}
                options={props.departmentsOptions}
              />
            </Form.Item>
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
export default observer(AddSubjectModalButton);

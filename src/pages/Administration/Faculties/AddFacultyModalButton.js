import React, { useState } from 'react';
import {
  Spin,
  Modal,
  Form,
  Input,
  Button,
  message,
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


/** @extends {BooleanState<import('./AddFacultyModalButton').Props>} */
class State extends BaseState {
  visible = new BooleanState(false);
  loading = new BooleanState(false);
  rules = {
    shortName: [
      required.shortName,
      maxLength.standard,
    ],
    fullName: [
      required.fullName,
      maxLength.standard,
    ],
  };

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
   * @param {import('./AddFacultyModalButton').FormData} formData
   */
  add(formData) {
    this.loading.value = true;
    http.post('/faculty', formData)
    .then(() => {
      this.visible.setFalse();
      this.props.onAdd();
      message.success(i18n.t('pages.Administration.Faculties.AddFacultyModalButton:add--success'), 3);
      this.formInstance.resetFields();
    })
    .catch((error) => {
      message.error(http.parseError(
        i18n.t('pages.Administration.Faculties.AddFacultyModalButton:add--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/**
 * Модальное окно добавления факультета
 *
 * @param {import('./AddFacultyModalButton').Props} props
 */
function AddFacultyModalButton(props) {
  const { t } = useTranslation(
    'pages.Administration.Faculties.AddFacultyModalButton',
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
              name="shortName"
              label={t('template.Form.shortName--label')}
              rules={state.rules.shortName}
            >
              <Input placeholder={t('template.Form.shortName--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="fullName"
              label={t('template.Form.fullName--label')}
              rules={state.rules.fullName}
            >
              <Input placeholder={t('template.Form.fullName--placeholder')}/>
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
export default observer(AddFacultyModalButton);

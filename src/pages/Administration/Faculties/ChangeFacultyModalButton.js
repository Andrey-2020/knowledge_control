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


/** @extends {BooleanState<import('./ChangeFacultyModalButton').Props>} */
class State extends BaseState {
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
  visible = new BooleanState(false);
  loading = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      change: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /** @param {import('./ChangeFacultyModalButton').FormData} formData */
  change(formData) {
    this.loading.value = true;
    http.put('/faculty', {}, { params: {
      ...this.props.changed,
      ...formData,
    }})
    .then(() => {
      this.visible.setFalse();
      this.props.onChange();
      message.success(i18n.t('pages.Administration.Faculties.ChangeFacultyModalButton:change--success'), 3);
    })
    .catch((error) => {
      message.error(http.parseError(
        i18n.t('pages.Administration.Faculties.ChangeFacultyModalButton:change--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/**
 * Модальное окно редактирования факультета
 *
 * @param {import('./ChangeFacultyModalButton').Props} props
 */
function ChangeFacultyModalButton(props) {
  const { t } = useTranslation(
    'pages.Administration.Faculties.ChangeFacultyModalButton',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
  state.props = props;
  state.formInstance = Form.useForm()[0];

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
            initialValues={props.changed}
            onFinish={state.change}
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
export default observer(ChangeFacultyModalButton);

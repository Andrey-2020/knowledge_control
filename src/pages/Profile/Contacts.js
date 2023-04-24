import React, { useState } from 'react';
import {
  Button,
  Modal,
  Input,
  Radio,
  Form,
  Tooltip,
  message,
  Spin,
  Space,
  Divider,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  MailOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
} from 'mobx';
import { observer } from 'mobx-react';
import clipboardCopy from 'clipboard-copy';
import i18n from 'i18next';

import { BooleanState } from 'plugins/mobx/fields';
import useOnce from 'utils/useOnce';
import http from 'plugins/http';
import store from 'globalStore';
import {
  USER_CONTACT_TYPES,
  userContactTypeTranslatorOptions,
} from 'globalStore/constants';
import {
  required,
  maxLength,
} from 'utils/formRules';
import eventStop from 'utils/eventStop';
import BaseState from 'plugins/mobx/BaseState';


export const USER_CONTACT_ICONS = {
  [USER_CONTACT_TYPES.EMAIL]: <MailOutlined style={{ fontSize: "20px" }}/>,
  [USER_CONTACT_TYPES.TELEGRAM]: (
    <img
      width="20px"
      alt="TELEGRAM"
      src={`${process.env.PUBLIC_URL}/img/telegram.png`}
    />
  ),
  [USER_CONTACT_TYPES.VKONTAKTE]: (
    <img
      width="20px"
      alt="VKONTAKTE"
      src={`${process.env.PUBLIC_URL}/img/VK.png`}
    />
  ),
};

/** @extends {BaseState<undefined>} */
class State extends BaseState {
  contacts = [];
  rules = {
    type: [],
    value: [
      required.shortName,
      maxLength.standard,
    ],
  };

  visible = new BooleanState(false);
  loading = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      contacts: observable.shallow,
      rules: observable,
      contactComponent: computed,
      typesRadioButtonsComponent: computed,
      getContacts: action.bound,
      add: action.bound,
      delete: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get contactComponent() {
    return this.contacts.map(({ id, type, value }) => (
      <Tooltip
        key={id}
        className="cursor-pointer"
        title={i18n.t('pages.Profile.Contacts:template.contact--Tooltip--title')}
        onClick={() => {
          clipboardCopy(value)
          .then(() => {
            message.success(i18n.t('pages.Profile.Contacts:template.contact--Tooltip--clipboardCopy--success'), 3);
          });
        }}
      >
        {USER_CONTACT_ICONS[type]}
        <span className="ml-2">
          {value}
        </span>
        <DeleteOutlined onClick={eventStop(() => { this.delete(id); })}/>
      </Tooltip>
    ));
  }

  get typesRadioButtonsComponent() {
    return userContactTypeTranslatorOptions().map(({ value, label }) => (
      <Tooltip
        key={value}
        title={label}
      >
        <Radio.Button value={value}>
          {USER_CONTACT_ICONS[value]}
        </Radio.Button>
      </Tooltip>
    ));
  }

  getContacts() {
    http.get('user-contact/search-by-user', { params: { userId: store.userId } })
    .then((response) => {
      runInAction(() => {
        this.contacts = response.data;
      });
    })
    .catch((error) => {
      message.error(http.parseError(i18n.t('pages.Profile.Contacts:getContacts--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }

  /** @param {import('./Contacts').FormData} formData */
  add(formData) {
    this.loading.value = true;
    formData.userId = store.userId;
    http.post('user-contact', formData)
    .then(() => {
      this.getContacts();
      message.success(i18n.t('pages.Profile.Contacts:add--success'), 3);
      this.formInstance.resetFields();
    })
    .catch((error) => {
      message.error(http.parseError(
        i18n.t('pages.Profile.Contacts:add--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }

  /** @param {number} id */
  delete(id) {
    this.loading.value = true;
    http.delete('user-contact', { params: { ids: [id] } })
    .then(() => {
      this.getContacts();
      message.success(i18n.t('pages.Profile.Contacts:remove--success'), 3);
    })
    .catch((error) => {
      message.error(http.parseError(i18n.t('pages.Profile.Contacts:remove--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/** Модальное окно дополнительных контактов пользователя */
function Contacts() {
  const { t } = useTranslation('pages.Profile.Contacts', { useSuspense: false });

  const state = useState(State.create)[0];
  state.formInstance = Form.useForm()[0];
  useOnce(state.getContacts);

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
          <h5>{t('template.available-contacts-title')}</h5>
          <Space direction="vertical">
            {state.contactComponent}
          </Space>
          <Divider/>
          <h5>{t('template.form-title')}</h5>
          <Form
            layout="horizontal"
            form={state.formInstance}
            onFinish={state.add}
          >
            <Form.Item
              name="type"
              label={t('template.Form.type--label')}
              rules={state.rules.type}
              initialValue={USER_CONTACT_TYPES.VKONTAKTE}
            >
              <Radio.Group
                buttonStyle="solid"
                size="small"
              >
                {state.typesRadioButtonsComponent}
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="value"
              label={t('template.Form.value--label')}
              rules={state.rules.value}
            >
              <Input placeholder={t('template.Form.value--placeholder')}/>
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
export default observer(Contacts);

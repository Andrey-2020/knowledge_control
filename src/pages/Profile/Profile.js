import React, { useState } from 'react';
import {
  Form,
  Spin,
  Input,
  message,
  Col,
  Button,
  Card,
  Row,
  Upload,
} from 'antd';
import { Helmet } from 'react-helmet';
import { PlusOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import {
  makeObservable,
  observable,
  computed,
  action,
  when,
  runInAction,
} from 'mobx';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import {
  required,
  valid,
  maxLength,
} from 'utils/formRules';
import useOnceWithRevoke from 'utils/useOnceWithRevoke';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import http from 'plugins/http';
import store from 'globalStore';
import {
  ROLES,
  roleTranslator,
} from 'globalStore/constants';
import ChangePasswordModal from 'pages/Profile/ChangePasswordModal';
import { uploadFile } from 'components/FileLoader';
import Contacts from 'pages/Profile/Contacts';
import 'pages/Profile/index.css';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<undefined>} */
class State extends BaseState {
  rules = {
    login: [
      required.login,
      maxLength.standard,
    ],
    email: [
      required.email,
      valid.email,
      maxLength.standard,
    ],
    phone: [maxLength.standard],
  };

  loading = new BooleanState(!store.UserData.id);

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      avatarImageComponent: computed,
      studyGroupOrDepartmentComponent: computed,
      setFalseLoadingWhenUserLoaded: action.bound,
      change: action.bound,
      uploadAvatar: action.bound,
    });
  }

  /** @returns {import('./Profile').State} */
  static create() {
    return new State();
  }

  get avatarImageComponent() {
    if (!store.UserData.avatarUrl) {
      return (
        <>
          <PlusOutlined/>
          {i18n.t('pages.Profile.Profile:avatarImageComponent--upload-text')}
        </>
      );
    }

    return (
      <img
        className="w-100 h-100 rounded-circle"
        alt="avatar"
        src={store.UserData.avatarUrl}
      />
    );
  }

  get studyGroupOrDepartmentComponent() {
    if (store.userRole === ROLES.USER && store.UserData.studyGroup) {
      return (
        <Col
          span={24}
          md={8}
        >
          <div className="text-form">
            <h5>
              {i18n.t('pages.Profile.Profile:template.text--studyGroup')}
            </h5>
            {store.UserData.studyGroup.shortName}
          </div>
        </Col>
      );
    }

    if (store.userRole === ROLES.TEACHER && store.UserData.department) {
      return (
        <Col
          span={24}
          md={8}
        >
          <div className="text-form">
            <h5>
              {i18n.t('pages.Profile.Profile:template.text--department')}
            </h5>
            {store.UserData.department.shortName}
          </div>
        </Col>
      );
    }
    return null;
  }

  setFalseLoadingWhenUserLoaded() {
    if (!store.UserData.id) {
      when(
        () => Boolean(store.UserData.id),
        () => {
          this.formInstance.setFieldsValue({
            login: store.UserData.login,
            email: store.UserData.email,
            phone: store.UserData.phone,
          });
          this.loading.setFalse();
        },
      );
    }
  }

  /** @param {import('./Profile').FormData} formData */
  change(formData) {
    this.loading.value = true;

    http.put('/user', {
      ...store.UserData.userData,
      ...formData,
    })
    .then(() => {
      message.success(i18n.t('pages.Profile.Profile:change--success'), 3);
      store.UserData.setData(formData);
    })
    .catch((error) => {
      createDecoratedErrorMessage(http.parseError(
        i18n.t('pages.Profile.Profile:change--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }

  /**
   * @param {import('antd/lib/upload').RcFile} file
   * @returns {false}
   */
  uploadAvatar(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error(i18n.t('pages.Profile.Profile:uploadAvatar--error-type'));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(i18n.t('pages.Profile.Profile:uploadAvatar--error-size'));
    }
    if (!(isJpgOrPng && isLt2M)) {
      return false;
    }

    uploadFile(file, this.cancelableRequests.componentUid)
    .then((avatarData) => {
      http.put('/user', {
        ...store.UserData.userData,
        avatarId: avatarData.id,
      })
      .then(() => {
        message.success(i18n.t('pages.Profile.Profile:uploadAvatar--success'), 3);
        store.UserData.setData({ avatarId: avatarData.id });
        runInAction(() => {
          store.UserData.avatarFile = file;
        });
      })
      .catch((error) => {
        createDecoratedErrorMessage(http.parseError(
          i18n.t('pages.Profile.Profile:uploadAvatar--error--response'), error), 5);
      })
      .finally(this.loading.setFalse);
    });

    return false;
  }
}

/** Страница профиля пользователя */
function Index() {
  const { t } = useTranslation('pages.Profile.Profile', { useSuspense: false });

  const state = useState(State.create)[0];
  state.cancelableRequests.componentUid = useCancelableRequests('Profile/Profile')[0];
  state.formInstance = Form.useForm()[0];

  useOnceWithRevoke(state.setFalseLoadingWhenUserLoaded);

  return (
    <>
      <Helmet>
        <title>
          {t('template.title')}
        </title>
      </Helmet>
      <Card
        style={{
          boxShadow: "2px 4px 15px var(--shadow-base)",
          borderRadius: "4px",
        }}
      >
        <Spin spinning={state.loading.value}>
          <Row>
            <Col
              span={24}
              md={4}
            >
              <Upload
                className="avatar text-center"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={state.uploadAvatar}
              >
                {state.avatarImageComponent}
              </Upload>
            </Col>
            <Col
              span={24}
              md={20}
            >
              <div className="card-text">
                {t('template.text--personal-data')}
              </div>
              <Row
                wrap
                gutter={32}
              >
                <Col
                  span={24}
                  md={8}
                >
                  <div className="text-form">
                    <h5>
                      {t('template.text--lastName')}
                    </h5>
                    {store.UserData.lastName}
                  </div>
                </Col>
                <Col
                  span={24}
                  md={8}
                >
                  <div className="text-form">
                    <h5>
                      {t('template.text--firstName')}
                    </h5>
                    {store.UserData.firstName}
                  </div>
                </Col>
                <Col
                  span={24}
                  md={8}
                >
                  <div className="text-form">
                    <h5>
                      {t('template.text--patronymic')}
                    </h5>
                    {store.UserData.patronymic}
                  </div>
                </Col>
                <Col
                  span={24}
                  md={8}
                >
                  <div className="text-form">
                    <h5>
                      {t('template.text--role')}
                    </h5>
                    {roleTranslator(store.UserData.role)}
                  </div>
                </Col>
                {state.studyGroupOrDepartmentComponent}
              </Row>
              <div className="card-text">
                {t('template.text--authorization-data')}
              </div>
              <Form
                layout="vertical"
                form={state.formInstance}
                onFinish={state.change}
              >
                <Row gutter={32}>
                  <Col
                    span={24}
                    md={8}
                  >
                    <Form.Item
                      name="login"
                      label={t('template.Form.login--label')}
                      rules={state.rules.login}
                      initialValue={store.UserData.login}
                    >
                      <Input
                        className="form-item"
                        placeholder={t('template.Form.login--placeholder')}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    span={24}
                    md={8}
                  >
                    <Form.Item
                      name="email"
                      label={t('template.Form.email--label')}
                      rules={state.rules.email}
                      initialValue={store.UserData.email}
                    >
                      <Input
                        className="form-item"
                        placeholder={t('template.Form.email--placeholder')}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    span={24}
                    md={8}
                  >
                    <Form.Item
                      name="phone"
                      label={t('template.Form.phone--label')}
                      rules={state.rules.phone}
                      initialValue={store.UserData.phone}
                    >
                      <Input
                        className="form-item"
                        placeholder={t('template.Form.phone--placeholder')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label={t('template.Form.password--label')}>
                  <ChangePasswordModal/>
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                >
                  {t('template.Form.submit--text')}
                </Button>
              </Form>
              <div className="mt-4 card-text">
                {t('template.text--additional-contacts')}
              </div>
              <Contacts/>
            </Col>
          </Row>
        </Spin>
      </Card>
    </>
  );
}
export default observer(Index);

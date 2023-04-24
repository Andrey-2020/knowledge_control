import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Spin,
  Select,
  Space,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import {
  makeObservable,
  observable,
  action,
} from 'mobx';
import { observer } from 'mobx-react';

import { required } from 'utils/formRules';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import { BooleanState } from 'plugins/mobx/fields';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import classes from 'pages/Login/index.module.scss';
import http from 'plugins/http';
import store from 'globalStore';
import BaseState from 'plugins/mobx/BaseState';


const LOGO_IMG_SRC = `${process.env.PUBLIC_URL}/img/logo.png`;

/** @extends {BaseState<undefined>} */
class State extends BaseState {
  rules = {
    login: [required.login],
    password: [required.password],
  };

  loading = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      send: action.bound,
      toMainPage: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /** @param {import('./index').FormData} formData */
  send(formData) {
    this.loading.value = true;
    http.post('/login', formData, {
      forCancel: { componentUid: this.cancelableRequests.componentUid },
    })
    .then((response) => {
      store.logIn(response.data);
      this.history.push(store.UserSettings.defaultMainPage);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        i18n.t('pages.Login.index:send--error'), error), 5);
      this.loading.setFalse();
    }));
  }

  toMainPage() {
    this.history.push('/main');
  }
}

/**
 * Компонент страницы входа
 */
function Index() {
  const history = useHistory();
  const { t } = useTranslation('pages.Login.index', { useSuspense: false });

  const state = useState(State.create)[0];
  state.history = history;
  state.cancelableRequests.componentUid = useCancelableRequests('Login/Index')[0];

  return (
    <>
      <Helmet>
        <title>
          {t('template.title')}
        </title>
      </Helmet>
      <div
        className={classnames(
          'p-2 text-right',
          classes['top-menu'],
        )}
      >
        <Space>
          <div>
            <span className="mr-1">
              {t('template.text--Language')}:
            </span>
            <Select
              options={store.Internationalization.localesOptions}
              value={store.Internationalization.locale}
              onChange={store.Internationalization.setLocale}
            />
          </div>
          <div>
            <span className="mr-1">
              {t('template.text--Theme')}:
            </span>
            <Select
              options={store.Themization.themesOptions}
              value={store.Themization.theme}
              onChange={store.Themization.setTheme}
            />
          </div>
          <Button onClick={state.toMainPage}>
            {t('template.button-on-main--text')}
          </Button>
        </Space>
      </div>
      <div className={classes.Login}>
        <div
          className={classnames(
            'p-1 p-md-5',
            classes.FormContainer,
          )}
        >
          <div>
            <div>
              <p>
                <img
                  width="75px"
                  height="50px"
                  alt="Ulstu"
                  src={LOGO_IMG_SRC}
                />
                <b>Learn.</b>Ulstu
              </p>
            </div>
            <div>
              <h5>
                {t('template.text--title')}!
              </h5>
            </div>
            <div className="mb-3 mb-md-5">
              <small>
                {t('template.text--description')}
              </small>
            </div>
            <div
              className={classnames(
                'mx-1 mx-md-3 mx-xl-5 p-4 p-md-5',
                classes.Form,
              )}
            >
              <h3 className="mb-4">
                {t('template.text--Authorization')}
              </h3>
              <Spin
                size="large"
                spinning={state.loading.value}
              >
                <Form
                  name="login-form"
                  onFinish={state.send}
                >
                  <Form.Item
                    name="login"
                    rules={state.rules.login}
                  >
                    <Input
                      className={classes.FormItem}
                      placeholder={t('template.Form.login--placeholder')}
                      prefix={<MailOutlined className="icon-size--middle"/>}
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={state.rules.password}
                  >
                    <Input.Password
                      className={classes.FormItem}
                      placeholder={t('template.Form.password--placeholder')}
                      prefix={<LockOutlined className="icon-size--middle"/>}
                    />
                  </Form.Item>
                  <Button
                    className="mt-2 mt-md-3 w-100 linear-gradient-button"
                    size="large"
                    htmlType="submit"
                  >
                    {t('template.Form.submit--text')}
                  </Button>
                </Form>
              </Spin>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default observer(Index);

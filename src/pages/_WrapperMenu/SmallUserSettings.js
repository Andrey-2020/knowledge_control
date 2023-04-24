import React, { useState } from 'react';
import { observer } from 'mobx-react';
import {
  makeObservable,
  action,
} from 'mobx';
import { SettingOutlined } from '@ant-design/icons';
import {
  Popover,
  Button,
  Select,
  Space,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import store from 'globalStore';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<undefined>} */
class State extends BaseState {
  visible = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      toFullSettingsPage: action.bound,
    });
  }

  static create() {
    return new State();
  }

  toFullSettingsPage() {
    this.visible.value = false;
    this.history.push('/profile/settings');
  }
}

/**
 * Короткая панелька настроек
 */
function SmallUserSettings() {
  const history = useHistory();
  const { t } = useTranslation(
    'pages._WrapperMenu.SmallUserSettings',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
  state.history = history;

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      title={t('template.Popover--title')}
      visible={state.visible.value}
      onVisibleChange={state.visible.set}
      content= {(
        <Space
          style={{ width: '250px' }}
          direction="vertical"
        >
          <div>
            {t('template.text--Theme')}:
            <Select
              className="w-100"
              options={store.Themization.themesOptions}
              value={store.Themization.theme}
              onChange={store.Themization.setTheme}
            />
          </div>
          <div>
            {t('template.text--Language')}:
            <Select
              className="w-100"
              options={store.Internationalization.localesOptions}
              value={store.Internationalization.locale}
              onChange={store.Internationalization.setLocale}
            />
          </div>
          {store.userRole && (
            <Button
              className="w-100"
              onClick={state.toFullSettingsPage}
            >
              {t('template.button-to-full-settings--text')}
            </Button>
          )}
        </Space>
      )}
    >
      <SettingOutlined
        className="icon-size--middle"
        onClick={state.visible.setTrue}
      />
    </Popover>
  );
}

export default observer(SmallUserSettings);

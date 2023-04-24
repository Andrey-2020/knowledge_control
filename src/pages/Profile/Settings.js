import React, { useState } from 'react';
import { observer } from 'mobx-react';
import {
  Space,
  Select,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { makeAutoObservable } from 'mobx';

import store from 'globalStore';


class State {

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get mainPageOptionsComponent() {
    return store.UserSettings.mainPageOptions.map((option) => (
      <Select.Option
        key={option.value}
        value={option.value}
      >
        {option.label()}
      </Select.Option>
    ));
  }

  /** @returns {import('./Settings').State} */
  static create() {
    return new State();
  }
}

/** Различные настройки аккаунта */
function Settings() {
  const { t } = useTranslation('pages.Profile.Settings', { useSuspense: false });

  const state = useState(State.create)[0];

  return (
    <Space
      className="p-4 w-100 text-light-3-bg"
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
      <div>
        {t('template.text--main-page')}:
        <Select
          className="w-100"
          value={store.UserSettings.defaultMainPage}
          onChange={store.UserSettings.setDefaultMainPage}
        >
          {state.mainPageOptionsComponent}
        </Select>
      </div>
    </Space>
  );
}
export default observer(Settings);

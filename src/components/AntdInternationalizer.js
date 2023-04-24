import React from 'react';
import { ConfigProvider } from 'antd';
import { observer } from 'mobx-react';

import store from 'globalStore';

/**
 * Проведение интернационализации
 * 
 * @see https://ant.design/docs/react/i18n
 */
function AntdInternationalizer({ children }) {
  return (
    <ConfigProvider locale={store.Internationalization.localeLibItems.antd}>
      {children}
    </ConfigProvider>
  );
}

export default observer(AntdInternationalizer);

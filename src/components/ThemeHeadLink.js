import React from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';

import store from 'globalStore';

/**
 * Проводит файл с цветами темы, название которого хранится в store.Themization
 */
function ThemeHeadLink() {
  return (
    <Helmet>
      <link
        rel="stylesheet"
        href={store.Themization.theme}
      />
    </Helmet>
  );
}

export default observer(ThemeHeadLink);

import React, { useMemo } from 'react';
import {
  useHistory,
  useLocation,
  Route,
} from 'react-router-dom';
import { autorun } from 'mobx';
import { Helmet } from 'react-helmet';

// Видимо, оно должно быть импортировано раньше bootstrap, иначе вертикальные gutter'ы ломаются
import 'plugins/antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/antd.css';
import 'core-js-pure/features/promise';

import useOnceWithRevoke from 'utils/useOnceWithRevoke';
import equalPathRoot from 'utils/equalPathRoot';
import store from 'globalStore';
import {
  hasAccess,
  withoutAuth,
  withPageWrapper,
  requiredAuth,
  noAuth,
  pagesByRole,
} from 'pages/routes';
import 'App.css';
import 'App.scss';
import WrapperMenu from 'pages/_WrapperMenu';
import ThemeHeadLink from 'components/ThemeHeadLink';
import AntdInternationalizer from 'components/AntdInternationalizer';
import GlobalErrorBoundary from 'components/GlobalErrorBoundary';
import SuspenseSwitch from 'plugins/router/SuspenseSwitch';

/**
 * Оборачивает авторизованные страницы в WrapperMenu и Switch,
 * а неавторизованные просто в Switch
 */
function PageWrapper() {
  const location = useLocation();
  
  // Отрендерить страницы в зависимости от роли
  const pages = useMemo(() => (
    <SuspenseSwitch>
      {(pagesByRole[store.userRole] || noAuth)
      .map(({ path, exact, page }) => (
        <Route
          key={path}
          path={path}
          exact={exact}
          component={page}
        />
      ))}
    </SuspenseSwitch>
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  ), [store.userRole]);

  // Если находимся на странице, где нужна обёртка менюшкой
  if (withPageWrapper.find(({ path }) => equalPathRoot(path, location.pathname))) {
    return (
      <WrapperMenu>
        {pages}
      </WrapperMenu>
    );
  }

  return pages;
}

export default function App() {
  const history = useHistory();

  useOnceWithRevoke(() => {
    // Если есть accessToken, то выставляются данные и проверяется текущая страница
    if (store.accessToken) {
      store.logIn({ token: store.accessToken });
      // store.logIn({
      //   accessToken: store.accessToken,
      //   refrashToken: store.refrashToken
      // });

      // Если залогинен и находится на странице без логина (может они и не нужны уже)
      if (withoutAuth.find(({ path }) => equalPathRoot(path, history.location.pathname))) {
        history.push('/main');
      } else {
        const pathWithoutAccess = hasAccess.find(({ path, access }) => {
          if (!equalPathRoot(path, history.location.pathname)) {
            return false;
          }
          return !access.includes(store.userRole);
        });
        if (pathWithoutAccess) {
          history.push('/main');
        }
      }
    // Если нет accessToken, но есть refrashToken, то обновим токен
    } else if (store.refrashToken) {
      store.refrashTokens(store.UserData.getUserData);
    }

    // Может и не нужно уже
    const autorunDisposer = autorun(() => {
      if (!store.isAuthorized && requiredAuth.find(
        ({ path }) => equalPathRoot(path, history.location.pathname)
      )) {
        history.push('/login');
      }
    });
    return autorunDisposer;
  });

  return (
    <GlobalErrorBoundary>
      <Helmet defaultTitle="АСУЗ - как у Гугла, только лучше"/>
      <ThemeHeadLink/>
      <AntdInternationalizer>
        <PageWrapper/>
      </AntdInternationalizer>
    </GlobalErrorBoundary>
  );
}

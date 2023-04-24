import React, { lazy } from 'react';
import { Redirect } from 'react-router-dom';
import { message } from 'antd';
import i18n from 'i18next';

import store from 'globalStore';
import {
  ROLES,
  ANY_ROLES,
  AUTHORIZATION_STATE,
} from 'globalStore/constants';

/**
 * Используется в конце Switch, служит редиректом со всех неопознанных url.
 * url для редиректа зависит от авторизированности пользователя
 */
export function AuthorizationStateRedirect() {
  if (window.location.pathname !== '/') {
    message.error(i18n.t('pages.routes:AuthorizationStateRedirect--error'), 3);
  }
  return (store.isAuthorized ?
    <Redirect to="/main"/> :
    <Redirect to="/login"/>
  );
}

function i18nTitleFunction(key) {
  return () => i18n.t(`pages.routes:routes.${key}`);
}

/**
 * @type {{
 *   path: string,
 *   exact: boolean,
 *   page: (() => JSX.Element | React.LazyExoticComponent),
 *   authorization: AUTHORIZATION_STATE,
 *   ?access: ROLES[],
 *   wrapPage: boolean,
 *   ?title: () => string,
 * }[]}
 * roles c authorization = AUTHORIZATION_STATE.REQUIRED || AUTHORIZATION_STATE.BOTH
 * title с wrapPage=true
 */
const routes = [
  {
    path: '/login',
    exact: true,
    page: lazy(() => import('pages/Login')),
    authorization: AUTHORIZATION_STATE.WITHOUT,
    wrapPage: false,
  },
  {
    path: '/profile',
    exact: false,
    page: lazy(() => import('pages/Profile')),
    authorization: AUTHORIZATION_STATE.REQUIRED,
    access: ANY_ROLES,
    wrapPage: true,
    title: i18nTitleFunction('Profile'),
  },
  {
    path: '/main',
    exact: true,
    page: lazy(() => import('pages/Main')),
    authorization: AUTHORIZATION_STATE.BOTH,
    access: ANY_ROLES,
    wrapPage: true,
    title: i18nTitleFunction('Main'),
  },
  {
    path: '/schedule',
    exact: false,
    page: lazy(() => import('pages/Schedule')),
    authorization: AUTHORIZATION_STATE.BOTH,
    access: ANY_ROLES,
    wrapPage: true,
    title: i18nTitleFunction('Schedule'),
  },
  {
    path: '/actions',
    exact: false,
    page: lazy(() => import('pages/Actions')),
    authorization: AUTHORIZATION_STATE.REQUIRED,
    access: ANY_ROLES,
    wrapPage: true,
    // title: i18nTitleFunction('Actions'),
    title: () => 'Мероприятия',
  },
  {
    path: '/subjects',
    exact: false,
    page: lazy(() => import('pages/Subjects')),
    authorization: AUTHORIZATION_STATE.REQUIRED,
    access: [ROLES.USER, ROLES.TEACHER],
    wrapPage: true,
    title: i18nTitleFunction('Subjects'),
  },
  {
    path: '/administration',
    exact: false,
    page: lazy(() => import('pages/Administration')),
    authorization: AUTHORIZATION_STATE.REQUIRED,
    access: [ROLES.ADMIN],
    wrapPage: true,
    title: i18nTitleFunction('Administration'),
  },
  {
    path: '*',
    exact: false,
    page: AuthorizationStateRedirect,
    authorization: AUTHORIZATION_STATE.BOTH,
    access: ANY_ROLES,
    wrapPage: false,
  },
];
export default routes;

export const withPageWrapper = routes.filter(({ wrapPage }) => wrapPage === true);

export const noAuth = routes.filter(
  ({ authorization }) => (
    authorization === AUTHORIZATION_STATE.WITHOUT ||
    authorization === AUTHORIZATION_STATE.BOTH
  )
);
export const hasAuth = routes.filter(
  ({ authorization }) => (
    authorization === AUTHORIZATION_STATE.BOTH ||
    authorization === AUTHORIZATION_STATE.REQUIRED
  )
);
export const withoutAuth = routes.filter(
  ({ authorization }) => authorization === AUTHORIZATION_STATE.WITHOUT
);
export const bothAuth = routes.filter(
  ({ authorization }) => authorization === AUTHORIZATION_STATE.BOTH
);
export const requiredAuth = routes.filter(
  ({ authorization }) => authorization === AUTHORIZATION_STATE.REQUIRED
);

export const hasAccess = routes.filter((route) => 'access' in route);
export const userAccess = hasAccess.filter(({ access }) => access.includes(ROLES.USER));
export const teacherAccess = hasAccess.filter(({ access }) => access.includes(ROLES.TEACHER));
export const adminAccess = hasAccess.filter(({ access }) => access.includes(ROLES.ADMIN));
export const pagesByRole = {
  [ROLES.USER]: userAccess,
  [ROLES.TEACHER]: teacherAccess,
  [ROLES.ADMIN]: adminAccess,
};

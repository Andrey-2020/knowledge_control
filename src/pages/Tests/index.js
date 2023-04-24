import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

import { ROLES } from 'globalStore/constants';
import store from 'globalStore';
import SuspenseSwitch from 'plugins/router/SuspenseSwitch';
import { AuthorizationStateRedirect } from 'pages/routes';
const TestList = lazy(() => import('pages/Tests/TestList'));
const Test = lazy(() => import('pages/Tests/Test'));
const TestDescription = lazy(() => import('pages/Tests/TestDescription'));
const GroupsTests = lazy(() => import('pages/Tests/TEACHER/GroupsTests'));
const AddTest = lazy(() => import('pages/Tests/TEACHER/AddTest'));
const EditTest = lazy(() => import('pages/Tests/TEACHER/EditTest'));

/**
 * Разводная по тестам
 */
export default function Tests() {
  if (store.userRole === ROLES.USER) {
    return (
      <SuspenseSwitch>
        {/* Список тестов по предмету */}
        <Route
          exact
          path="/subjects/:subjectId/tests"
          component={TestList}
        />
        {/* Конкретный тест */}
        <Route
          exact
          path="/subjects/:subjectId/tests/:themeId"
          component={Test}
        />
        <Route
          exact
          path="/subjects/:subjectId/tests/:themeId/about"
          component={TestDescription}
        />
        <AuthorizationStateRedirect/>
      </SuspenseSwitch>
    );
  }

  if (store.userRole === ROLES.TEACHER) {
    return (
      <SuspenseSwitch>
        {/* Добавление теста */}
        <Route
          exact
          path="/subjects/:subjectId/tests/:themeId/edit"
          component={EditTest}
        />
        {/* Добавление теста */}
        <Route
          exact
          path="/subjects/:subjectId/tests/add"
          component={AddTest}
        />
        {/* Список тестов с переходом на добавление */}
        <Route
          exact
          path="/subjects/:subjectId/tests"
          component={GroupsTests}
        />
        <AuthorizationStateRedirect/>
      </SuspenseSwitch>
    );
  }

  return 'Админы пока тут ничего не умеют';
}

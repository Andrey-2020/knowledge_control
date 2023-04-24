import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

import { ROLES } from 'globalStore/constants';
import store from 'globalStore';
import SuspenseSwitch from 'plugins/router/SuspenseSwitch';
import { AuthorizationStateRedirect } from 'pages/routes';

const TabsSubjectActivity = lazy(() => import('pages/Subjects/TabsSubjectActivity'));
const Subject = lazy(() => import('pages/Subjects/Subject'));
const Tasks = lazy(() => import('pages/Tasks'));
const Tests = lazy(() => import('pages/Tests'));
const ListReferences = lazy(() => import('pages/Subjects/ListReferences'));

/**
 * Ветка страниц про предметы:
 * - список предметов
 * - список заданий
 * - список тестов
 * - список литературы
 */
export default function Subjects() {
  if (store.userRole === ROLES.USER || store.userRole === ROLES.TEACHER) {
    return (
      <SuspenseSwitch>
        {/* Список предметов */}
        <Route
          exact
          path="/subjects"
          component={TabsSubjectActivity}
        />
        {/* Описание конкретного предмета */}
        <Route
          exact
          path="/subjects/:subjectId"
          component={Subject}
        />
        {/* Задания по предмету */}
        <Route
          path="/subjects/:subjectId/tasks"
          component={Tasks}
        />
        {/* Тесты по предмету */}
        <Route
          path="/subjects/:subjectId/tests"
          component={Tests}
        />
        {/* Список литературы по предмету */}
        <Route
          exact
          path="/subjects/:subjectId/list-references"
          component={ListReferences}
        />
        <AuthorizationStateRedirect/>
      </SuspenseSwitch>
    );
  }

  return 'Ты пока здесь ничего не умеешь';
}

import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

import { ROLES } from 'globalStore/constants';
import store from 'globalStore';
import { AuthorizationStateRedirect } from 'pages/routes';
import SuspenseSwitch from 'plugins/router/SuspenseSwitch';
const TaskListForUser = lazy(() => import('pages/Tasks/TaskList/ForUser'));
const TaskListForTeacher = lazy(() => import('pages/Tasks/TaskList/ForTeacher'));

/**
 * Разводка страницы заданий
 */
export default function Tasks() {
  if (store.userRole === ROLES.USER) {
    return (
      <SuspenseSwitch>
        {/* Задания по предмету пользовательские */}
        <Route
          exact
          path="/subjects/:subjectId/tasks"
          component={TaskListForUser}
        />
        <AuthorizationStateRedirect/>
      </SuspenseSwitch>
    );
  }

  if (store.userRole === ROLES.TEACHER) {
    return (
      <SuspenseSwitch>
        {/* Задания по предмету учительские */}
        <Route
          path="/subjects/:subjectId/tasks"
          component={TaskListForTeacher}
        />
        <AuthorizationStateRedirect/>
      </SuspenseSwitch>
    );
  }

  return 'Админы тут пока ничего не умеют';
}

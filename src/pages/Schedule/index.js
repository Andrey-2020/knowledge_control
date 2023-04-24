import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

import { AuthorizationStateRedirect } from 'pages/routes';
import SuspenseSwitch from 'plugins/router/SuspenseSwitch';
const Schedule = lazy(() => import('pages/Schedule/Schedule'));

/** Страница расписания */
export default function Index() {
  return (
    <SuspenseSwitch>
      {/* Расписание */}
      <Route
        exact
        path="/schedule"
        component={Schedule}
      />
      <AuthorizationStateRedirect/>
    </SuspenseSwitch>
  );
}

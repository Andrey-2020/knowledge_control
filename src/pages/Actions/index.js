import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

import { ROLES } from 'globalStore/constants';
import store from 'globalStore';
import { AuthorizationStateRedirect } from 'pages/routes';
import SuspenseSwitch from 'plugins/router/SuspenseSwitch';
const ActionsList = lazy(() => import('pages/Actions/ActionsList'));
const ActionView = lazy(() => import('pages/Actions/ActionView'));
const AddAction = lazy(() => import('pages/Actions/ADMIN/AddAction'));
const EditAction = lazy(() => import('pages/Actions/ADMIN/EditAction'));


export default function Actions() {
  if (store.userRole === ROLES.ADMIN) {
    return (
      <SuspenseSwitch>
        <Route
          path="/actions/:actionId/edit"
          component={EditAction}
        />
        <Route
          path="/actions/add"
          component={AddAction}
        />
        <Route
          path="/actions/:actionId"
          component={ActionView}
        />
        <Route
          exact
          path="/actions"
          component={ActionsList}
        />
        <AuthorizationStateRedirect/>
      </SuspenseSwitch>
    );
  }

  return (
    <SuspenseSwitch>
      <Route
        path="/actions/:actionId"
        component={ActionView}
      />
      <Route
        path="/actions"
        component={ActionsList}
      />
      <AuthorizationStateRedirect/>
    </SuspenseSwitch>
  );
}

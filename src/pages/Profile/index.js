import React, { useState } from 'react';
import { Tabs } from 'antd';
import {
  Switch,
  Route,
  useHistory,
} from 'react-router-dom';
import invert from 'lodash/invert';
import {
  makeObservable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';

import {
  ROLES,
  ANY_ROLES,
} from 'globalStore/constants';
import store from 'globalStore';
import { AuthorizationStateRedirect } from 'pages/routes';
import Profile from 'pages/Profile/Profile';
import Settings from 'pages/Profile/Settings';
import GroupList from 'pages/Profile/GroupList';
import BaseState from 'plugins/mobx/BaseState';


/** @type {import('.').TabDescription[]} */
const tabs = [
  {
    key: 'profile',
    path: '/profile',
    accessRoles: ANY_ROLES,
    tabComponent: Profile,
  },
  {
    key: 'settings',
    path: '/profile/settings',
    accessRoles: ANY_ROLES,
    tabComponent: Settings,
  },
  {
    key: 'group-list',
    path: '/profile/group-list',
    accessRoles: [ROLES.TEACHER],
    tabComponent: GroupList,
  },
];
const tabsKeyPath = tabs.reduce((result, tab) => {
  result[tab.key] = tab.path;
  return result;
}, {});
const tabsPathKey = invert(tabsKeyPath);
const tabsByRoles = {
  [ROLES.USER]: tabs.filter(({ accessRoles }) => accessRoles.includes(ROLES.USER)),
  [ROLES.TEACHER]: tabs.filter(({ accessRoles }) => accessRoles.includes(ROLES.TEACHER)),
  [ROLES.ADMIN]: tabs.filter(({ accessRoles }) => accessRoles.includes(ROLES.ADMIN)),
  undefined: [],
};

/** @extends {BaseState<undefined>} */
class State extends BaseState {
  constructor() {
    super();
    makeObservable(this, {
      availableTabs: computed,
      tabsPaneComponent: computed,
      tabsSwitchComponent: computed,
      selectTab: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get availableTabs() {
    return tabsByRoles[store.userRole];
  }

  get tabsPaneComponent() {
    return this.availableTabs.map((tab) => (
      <Tabs.TabPane
        key={tab.key}
        tab={i18n.t(`pages.Profile.index:tabs--${tab.key}`)}
      />
    ));
  }

  get tabsSwitchComponent() {
    return (
      <Switch>
        {this.availableTabs.map((tab) => (
          <Route
            key={tab.key}
            exact
            path={tab.path}
            component={tab.tabComponent}
          />
        ))}
        <AuthorizationStateRedirect/>
      </Switch>
    );
  }

  /** @param {string} tabKey */
  selectTab(tabKey) {
    this.history.push(tabsKeyPath[tabKey]);
  }
}

/** Табы личного кабинета и информации о пользователе */
function Index() {
  const state = useState(State.create)[0];
  state.history = useHistory();

  return (
    <>
      <Tabs
        className="px-3 text-light-5-bg"
        activeKey={tabsPathKey[state.history.location.pathname]}
        onChange={state.selectTab}
      >
        {state.tabsPaneComponent}
      </Tabs>
      {state.tabsSwitchComponent}
    </>
  );
}
export default observer(Index);

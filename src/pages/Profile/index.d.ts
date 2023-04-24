import { History } from 'history';

import { ROLES } from 'globalStore/constants';
import BaseState from 'plugins/mobx/BaseState';


export interface TabDescription {
  key: string,
  path: string,
  accessRoles: ROLES[],
  tabComponent: () => JSX.Element,
}

class State extends BaseState<undefined> {
  get availableTabs(): TabDescription[];
  get tabsPaneComponent(): JSX.Element[];
  get tabsSwitchComponent(): JSX.Element;
  
  static create(): State;

  selectTab(tabKey: string): void;
}

/** Табы личного кабинета и информации о пользователе */
export default function Index(): JSX.Element;

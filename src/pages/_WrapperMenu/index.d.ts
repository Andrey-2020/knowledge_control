import { History } from 'history';

import {
  AUTHORIZATION_STATE,
  ROLES,
} from 'globalStore/constants';
import BaseState from 'plugins/mobx/BaseState';
import { BooleanState } from 'plugins/mobx/fields';


/**
 * Один элемент левого меню
 */
export interface PageMenuItem {
  path: string,
  title: () => string,
  authorization: AUTHORIZATION_STATE,
  access: ROLES,
  icon: React.FunctionComponentElement,
}

export class State extends BaseState<undefined> {
  activeMenuItem: {
    pathname: string,
    menuItem: [string],
  };
  menuCollapsed: BooleanState;
  get pageMenuItems(): PageMenuItem[];
  get pageMenuItemsComponent(): JSX.Element[];
  get activeMenuItem(): [string];
  get fullName(): string;
  get logOutComponent(): JSX.Element;
  static create(): State;
  recalcActiveMenuItem(): void;
  toPage(path: string): void;
  toProfilePage(): void;
  showContacts(): void;
  /** Выводит модальное окно требующее подтверждение выхода */
  confirmLogout(): void;
}

/**
 * Компонент, который оборачивает страницы в меню
 */
export default function WrapperMenu(args: {
  children: JSX.Element,
}): JSX.Element;

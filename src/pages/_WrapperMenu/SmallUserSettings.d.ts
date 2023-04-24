import { History } from 'history';

import BaseState from 'plugins/mobx/BaseState';


export class State extends BaseState<undefined> {
  history: History;
  visible: {
    value: boolean;
    set(value: boolean): void;
    setTrue(): void;
  };
  static create(): State;
  toFullSettingsPage(): void;
}

/**
 * Маленькая панелька настроек
 */
export default function SmallUserSettings(): JSX.Element;

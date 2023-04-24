import { Store } from 'globalStore';
import { Options } from 'CommonTypes';

export declare const DEFAULT_MAIN_PAGE = '/main';

/** Хранилище данных настроек пользователя */
export default class UserSettings {
  defaultMainPage: string;

  constructor(rootStore: Store);

  get mainPageOptions(): {
    value: string,
    label: () => string;
  }[];

  setDefaultMainPage(value: string): void;

  /** Очистка данных пользователя */
  logOut() {}
};

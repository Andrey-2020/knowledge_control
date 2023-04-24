import { makeAutoObservable } from 'mobx';

import {
  LogOut,
  Store,
} from 'globalStore';
import { Options } from 'CommonTypes';

/**
 * Хранилище данных цветовой темы приложения
 */
export default class Themization implements LogOut {

  themes: {
    url: string,
    title: string,
  }[];

  theme: string;

  constructor(rootStore: Store);

  /**
   * Computed getter для цветовых тем приложения
   *
   * @getter
   */
  get themesOptions(): Options<string>;

  /**
   * Выставляет цветовую тему приложения
   *
   * @throws {Error}
   */
  setTheme(theme: string): void;
};

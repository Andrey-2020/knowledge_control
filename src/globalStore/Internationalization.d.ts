import { Locale } from 'antd/lib/locale-provider';

import { Options } from 'CommonTypes';
import {
  LogOut,
  Store,
} from 'globalStore';
import { SettedState } from 'plugins/mobx/fields';


export interface LocaleLibItems {
  i18next: string,
  moment: string,
  antd: Locale,
}

export declare type LocalesLibItems = {
  [localeUrl: string]: LocaleLibItems,
}

export declare class TranslationCacheComponent {
  name: string;
  translationKeys: string[];
  translations: {
    [translationKey: string]: string;
  };
  isActive: SettedState;

  constructor(
    name: string,
    translationKeys: string[]
  );

  reTranslate(): void;

  activateCache(): () => void;
}

/**
 * Хранилище данных интернационализации приложения
 */
export default class Internationalization implements LogOut {

  locales: {
    title: string,
    url: string,
  }[];

  /**
   * moment: https://stackoverflow.com/questions/31109303/how-to-obtain-a-list-of-available-locale-keys-from-momentjs-with-locale
   * antd: https://ant.design/docs/react/i18n
   * i18next: наши названия
   */
  localesLibItems: LocalesLibItems;

  locale: string;

  cachedTranslations: {
    [componentName: string]: TranslationCacheComponent,
  };

  constructor(rootStore: Store);

  /**
   * Computed getter для выбора локалирзации
   *
   * @getter
   */
  get localesOptions(): Options<string>;

  /**
   * Computed getter для цветовых тем приложения
   *
   * @getter
   */
  get localeLibItems(): LocaleLibItems;

  /**
   * Выставляет цветовую тему приложения
   *
   * @param {string} theme - url темы
   * @throws {Error}
   */
  setLocale(locale: string): void;
};

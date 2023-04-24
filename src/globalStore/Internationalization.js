import {
  makeAutoObservable,
  observable,
  autorun,
  action,
  reaction,
} from 'mobx';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/ru';
import ru_RU from 'antd/lib/locale/ru_RU';
import en_US from 'antd/lib/locale/en_US';

import ru from 'plugins/locales/ru.json';
import en from 'plugins/locales/en.json';
import { SettedState } from 'plugins/mobx/fields';
import createSelector from 'utils/createSelector';
import store from 'globalStore';


class TranslationCacheComponent {
  /** @type {string} */
  name;
  /** @type {string[]} */
  translationKeys;
  translations = {};
  isActive = new SettedState(false);

  /**
   * @param {string} name
   * @param {string[]} translationKeys
   */
  constructor(name, translationKeys) {
    this.name = name;
    this.translationKeys = translationKeys;

    makeAutoObservable(this, {
      name: false,
      translationKeys: false,
      translations: observable.shallow,
    }, { autoBind: true });
  }

  reTranslate() {
    if (this.isActive.value === false) {
      return;
    }
    for (const key of this.translationKeys) {
      this.translations[key] = i18n.t(`${this.name}:${key}`);
    }
  }

  activateCache() {
    this.isActive.value = true;
    this.reTranslate();
    const reactionDispiser = reaction(
      () => store.Internationalization.locale,
      this.reTranslate,
    );

    return () => {
      reactionDispiser();
      this.isActive.set(false);
    };
  }
}

// const localesBaseUrl = `${process.env.PUBLIC_URL}/locales`;

const resources = {
  ru,
  en,
};

/**
 * Хранилище данных интернационализации приложения
 */
export default class Internationalization {

  /**
   * @type {{
   *   title: string,
   *   url: string,
   * }[]}
   */
  locales = [
    {
      title: 'Русский',
      // url: `${localesBaseUrl}/ru.json`,
      url: 'ru',
    },
    {
      title: 'English',
      // url: `${localesBaseUrl}/ru.json`,
      url: 'en',
    },
  ];

  /**
   * moment: https://stackoverflow.com/questions/31109303/how-to-obtain-a-list-of-available-locale-keys-from-momentjs-with-locale
   * antd: https://ant.design/docs/react/i18n
   * i18next: наши названия
   *
   * @type {import('./Internationalization').LocalesLibItems}
   */
  localesLibItems = {
    'ru': {
      moment: 'ru',
      antd: ru_RU,
      i18next: 'ru',
    },
    'en': {
      moment: 'en',
      antd: en_US,
      i18next: 'en',
    },
  };

  /** @type {string} */
  _locale = localStorage.getItem('locale') || this.locales[0].url;
  locale = this._locale;

  cachedTranslations = createSelector([
    new TranslationCacheComponent('pages.Administration.Departments.index', [
      'columns.shortName--title',
      'columns.fullName--title',
      'columns.facultyId--title',
      'columns.facultyId--render--empty',
      'columns.studyGroupIds--title',
      'columns.studyGroupIds--render--empty',
      'columns.subjectIds--title',
      'columns.subjectIds--render--empty',
      'columns.actions--title',
      'columns.actions--render--delete--text',
      'remove.title',
      'remove.content',
      'remove.okText',
      'remove.cancelText',
      'remove.onOk--success',
      'remove.onOk--error',
      'template.fast-search--placeholder',
      'template.button-delete-selected--text',
    ]),
  ], 'name');

  /** @param {import('globalStore').Store} rootStore */
  constructor(rootStore) {
    i18n
    .use(initReactI18next)
    .init({
      debug: process.env.NODE_ENV === 'develop',

      resources,
      lng: this._locale,
      fallbackLng: this.locales[0].url,
      interpolation: {
        escapeValue: false,
      },
    });

    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false }, { autoBind: true });

    const setLocale = action(() => {
      this.locale = this._locale;
      localStorage.setItem('locale', this.locale);
    });
    autorun(() => {
      i18n.changeLanguage(this.localeLibItems.i18next)
      .then(setLocale);
      moment.locale(this.localeLibItems.moment);
    });
  }

  /**
   * Computed getter для выбора локалирзации
   *
   * @getter
   * @returns {import('CommonTypes').Options<string>}
   */
  get localesOptions() {
    return this.locales.map(({ url, title }) => ({
      value: url,
      label: title,
    }));
  }

  /**
   * Computed getter для цветовых тем приложения
   *
   * @getter
   * @returns {import('./Internationalization').LocaleLibItems}
   */
  get localeLibItems() {
    return this.localesLibItems[this._locale];
  }

  /**
   * Выставляет цветовую тему приложения
   *
   * @param {string} theme - url темы
   * @throws {Error}
   */
  setLocale(locale) {
    if (!this.locales.find(({ url }) => url === locale)) {
      throw new Error(`Invalid value "locale": ${locale}`);
    }
    this._locale = locale;
  }

  logOut() {}
};

import { makeAutoObservable } from 'mobx';

/**
 * Хранилище данных цветовой темы приложения
 */
export default class Themization {

  /**
   * @type {{
   *   url: string,
   *   title: string,
   * }[]}
   */
  themes = [
    {
      url: `${process.env.PUBLIC_URL}/themes/light.css`,
      title: 'Светлая',
    },
    {
      url: `${process.env.PUBLIC_URL}/themes/dark.css`,
      title: 'Тёмная',
    },
  ];

  /** @type {string} */
  theme = localStorage.getItem('theme') || `${process.env.PUBLIC_URL}/themes/light.css`;

  /** @param {import('globalStore').Store} rootStore */
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  /**
   * Computed getter для цветовых тем приложения
   *
   * @getter
   * @returns {import('CommonTypes').Options<string>}
   */
  get themesOptions() {
    return this.themes.map(({ url, title }) => ({
      value: url,
      label: title,
    }));
  }

  /**
   * Выставляет цветовую тему приложения
   *
   * @param {string} theme - url темы
   * @throws {Error}
   */
  setTheme(theme) {
    if (!this.themes.find(({ url }) => url === theme)) {
      throw new Error(`Invalid value "theme": ${theme}`);
    }
    this.theme = theme;
    localStorage.setItem('theme', theme);
  }
  
  logOut() {}
};

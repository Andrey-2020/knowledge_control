import { makeAutoObservable } from 'mobx';
import { pagesByRole } from 'pages/routes';

const DEFAULT_MAIN_PAGE = '/main';

/** Хранилище данных настроек пользователя */
export default class UserSettings {
  /** @type {string?} */
  defaultMainPage = localStorage.getItem('settings:defaultMainPage') || DEFAULT_MAIN_PAGE;

  /** @param {import('globalStore').Store} rootStore */
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get mainPageOptions() {
    return pagesByRole[this.rootStore.userRole]
      .filter((page) => 'title' in page)
      .map(({ path, title }) => ({
        value: path,
        label: title,
      }));
  }

  /** @param {string} value */
  setDefaultMainPage(value) {
    const page = pagesByRole[this.rootStore.userRole].find(({ path }) => path === value);
    if (page) {
      this.defaultMainPage = value;
    } else {
      console.error(`Invalid set "defaultMainPage" with value: ${value}, set default`);
      this.defaultMainPage = DEFAULT_MAIN_PAGE;
    }
    localStorage.setItem('settings:defaultMainPage', this.defaultMainPage);
  }

  /** Очистка данных пользователя */
  logOut() {}
};

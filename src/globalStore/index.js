import {
  makeAutoObservable,
  computed,
} from 'mobx';
import cookie from 'js-cookie';
import jwt_decode from 'jwt-decode';
/* eslint-disable-next-line no-unused-vars */
import axios from 'axios';

/* eslint-disable-next-line no-unused-vars */
import http, { parseError } from 'plugins/http';
/* eslint-disable-next-line no-unused-vars */
import { ROLES } from 'globalStore/constants';
import AdministrationPageData from 'globalStore/AdministrationPageData';
import Themization from 'globalStore/Themization';
import UserData from 'globalStore/UserData';
import Internationalization from 'globalStore/Internationalization';
import UserSettings from 'globalStore/UserSettings';

/**
 * Глобальное хранилище mobx.
 * Все хранилища обязаны иметь функцию logOut,
 * которая вызывается при выходе пользователя из аккаунта.
 * В ней необходимо очищать все данные текущего пользователя.
 */
class Store {
  // В будущем уедет
  /**
   * @type {{
   *   studyGroups: import('DBModels').StudyGroup[],
   *   studyGroupSemesterRef: {
   *     studyGroupToSemester: {
   *       [id: number]: number,
   *     },
   *     semesterToStudyGroup: {
   *       [id: number]: number,
   *     },
   *   },
   *   setStudyGroups: (value: import('DBModels').StudyGroup[]) => void,
   *   connectSemestersAndStudyGroups: (semesters: import('DBModels').SubjectSemester[]) => void,
   *   studyGroupsOptions: import('mobx').IComputedValue<{
   *     value: string,
   *     label: string,
   *   }[]>
   * }}
   */
  studyGroupsData = {
    studyGroups: [],
    studyGroupSemesterRef: {
      studyGroupToSemester: {},
      semesterToStudyGroup: {},
    },
    setStudyGroups(value) {
      this.studyGroups = value;
    },
    connectSemestersAndStudyGroups(semesters) {
      for (const semester of semesters) {
        this.studyGroupSemesterRef.studyGroupToSemester[semester.studyGroupId] = semester.id;
        this.studyGroupSemesterRef.semesterToStudyGroup[semester.id] = semester.studyGroupId;
      }
    },
    studyGroupsOptions: computed(() => {
      return this.studyGroupsData.studyGroups.map(
        ({ id, shortName }) => ({ value: id, label: shortName})
      );
    })
  };

  /** @type {?ROLES} */
  userRole = null;
  /** @type {?number} */
  userId = null;

  constructor() {
    makeAutoObservable(this, {
      accessToken: false,
      refrashToken: false,
      refrashTokenExpired: false,
    }, { autoBind: true });
    this.AdministrationPageData = new AdministrationPageData(this);
    this.Themization = new Themization(this);
    this.UserData = new UserData(this);
    this.Internationalization = new Internationalization(this);
    this.UserSettings = new UserSettings(this);

    this.subStores = [
      this.UserData,
      this.AdministrationPageData,
      this.Themization,
      this.Internationalization,
      this.UserSettings,
    ];
  }

  /**
   * accessToken из cookie
   *
   * @getter
   * @returns {string}
   */
  get accessToken() {
    return cookie.get('accessToken');
  }
  /**
   * Занесение accessToken в cookie, а также его расшифровка и
   * выставление userRole, userId, refrashTokenExpired.
   * Если расшифровка неудачна, то происходит разлогинивание
   *
   * @setter
   * @param {string} value - accessToken
   */
  set accessToken(value) {
    let accessTokenData;
    try {
      accessTokenData = jwt_decode(value);
    } catch(error) {
      this.logOut();
    }
    this.userRole = accessTokenData.role;
    this.userId = accessTokenData.user_id;

    // в миллисекундах
    this.refrashTokenExpired = new Date(accessTokenData.exp * 1000);

    cookie.set('accessToken', value, {
      expires: (this.refrashTokenExpired - new Date()) / (1000 * 60 * 60 * 24)
    });
  }

  /**
   * refrashToken из cookie
   *
   * @getter
   * @returns {?string}
   */
  get refrashToken() {
    return cookie.get('refrashToken');
  }
  /**
   * Занесение accessToken в cookie
   *
   * @setter
   * @param {string} value - refrashToken
   */
  set refrashToken(value) {
    cookie.set('refrashToken', value);
  }

  /**
   * Получает оставшееся время refrashToken из cookie в виде объекта Date
   * или null, если время в cookie не задано
   *
   * @getter
   * @returns {?Date} Оставшееся время refrashToken или null
   */
  get refrashTokenExpired() {
    /** @member {string} refrashTokenExpired - значение из cookie */
    const refrashTokenExpired = cookie.get('refrashTokenExpired');

    if (refrashTokenExpired) {
      return new Date(refrashTokenExpired);
    }
    return null;
  }
  /**
   * Задаёт оставшееся время refrashToken в cookie
   *
   * @setter
   * @param {Date} value - Оставшееся время refrashToken
   */
  set refrashTokenExpired(value) {
    cookie.set('refrashTokenExpired', value);
  }

  /**
   * Проверяет, авториризован ли пользователь
   *
   * @getter
   * @returns {boolean}
   */
  get isAuthorized() {
    return this.refrashTokenExpired || this.refrashToken || this.accessToken || this.userId || this.userRole;
  }

  /**
   * Задаёт accessToken и refrashToken, вызывая их setter'ы
   *
   * token - временная мера, на самом деле accessToken
   *
   * @param {{
   *   token: string,
   *   accessToken: string,
   *   refrashToken: string,
   * }}
   */
  logIn({ token }) { //accessToken, refrashToken
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.accessToken = token;
    this.UserData.getUserData();

    //this.accessToken = accessToken;
    //this.refrashToken = refrashToken;
  }

  /**
   * Обновляет accessToken и refrashToken через запрос на сервер
   *
   * @param {() => void} refrashCallback
   */
  refrashTokens(refrashCallback=() => {}) {
    return;
    // refrash нужно делать через отдельный axios, иначе бесконечный цикл при просрочке
    // TODO: Необходимо запускать лишь один запрос
    // axios.post('http://test.asus.russianitgroup.ru/api/auth/refrash',
    //   { refrashToken: this.refrashToken }
    // )
    // .then((response) => {
    //   this.logIn(response.data);
    //   refrashCallback()
    // })
    // .catch((error) => {
    //   createDecoratedErrorMessage(parseError(
    //     'Не удалось обновить данные аутентификации', error), 5);
    //   if (error.response && error.response.status === 401) {
    //     this.logOut();
    //   }
    // });
  }

  /**
   * Отправляет на сервер запрос о выходе,
   * выставляет userRole и userId в null,
   * удаляет из cookie accessToken, refrashToken, refrashTokenExpired
   */
  logOut() {
    // refrash нужно делать через отдельный axios, иначе бесконечный цикл при просрочке
    // axios.post('http://test.asus.russianitgroup.ru/api/auth/logout',
    //   { refrashToken: this.refrashToken }
    // )
    // Очистка общих данных

    cookie.remove('accessToken');
    cookie.remove('refrashToken');
    cookie.remove('refrashTokenExpired');
    delete http.defaults.headers.common[http.authTokenName];
    this.userRole = null;
    this.userId = null;

    this.subStores.forEach((subStore) => {
      subStore.logOut();
    });
  }
}

export default new Store();

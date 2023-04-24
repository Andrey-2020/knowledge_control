import { IComputedValue } from 'mobx';

import {
  StudyGroup,
  SubjectSemester,
} from 'DBModels';
import { ROLES } from 'globalStore/constants';
import AdministrationPageData from 'globalStore/AdministrationPageData';
import Themization from 'globalStore/Themization';
import UserData from 'globalStore/UserData';
import Internationalization from 'globalStore/Internationalization';
import UserSettings from 'globalStore/UserSettings';

export interface LogOut {
  /**
   * Очистка данных пользователя
   */
  logOut(): void;
}

/**
 * Глобальное хранилище
 */
export class Store {
  AdministrationPageData: AdministrationPageData;
  Themization: Themization;
  UserData: UserData;
  Internationalization: Internationalization;
  UserSettings: UserSettings;

  studyGroupsData: {
    studyGroups: StudyGroup[],
    studyGroupSemesterRef: {
      studyGroupToSemester: {
        [id: number]: number,
      },
      semesterToStudyGroup: {
        [id: number]: number,
      },
    },
    setStudyGroups: (value: StudyGroup[]) => void,
    connectSemestersAndStudyGroups: (semesters: SubjectSemester[]) => void,
    studyGroupsOptions: IComputedValue<{
      value: string,
      label: string,
    }[]>
  };

  userRole?: ROLES;
  userId?: number;

  /**
   * accessToken из cookie
   *
   * @getter
   */
  get accessToken(): ?string;
  /**
   * Занесение accessToken в cookie, а также его расшифровка и
   * выставление userRole, userId, refrashTokenExpired.
   * Если расшифровка неудачна, то происходит разлогинивание
   *
   * @setter
   */
  set accessToken(value: string): void;

  /**
   * refrashToken из cookie
   *
   * @getter
   */
  get refrashToken(): ?string;
  /**
   * Занесение accessToken в cookie
   *
   * @setter
   */
  set refrashToken(value: string): void;

  /**
   * Получает оставшееся время refrashToken из cookie в виде объекта Date
   * или null, если время в cookie не задано
   *
   * @getter
   */
  get refrashTokenExpired(): ?Date;
  /**
   * Задаёт оставшееся время refrashToken в cookie
   *
   * @setter
   */
  set refrashTokenExpired(value: Date): void;

  /**
   * Проверяет, авториризован ли пользователь
   *
   * @getter
   */
  get isAuthorized(): boolean;

  /**
   * Задаёт accessToken и refrashToken, вызывая их setter'ы
   *
   * token - временная мера, на самом деле accessToken
   */
  logIn(args: {
    token: string,
  }): void;

  /**
   * Обновляет accessToken и refrashToken через запрос на сервер
   */
  refrashTokens(refrashCallback: () => void): void;

  /**
   * Отправляет на сервер запрос о выходе,
   * выставляет userRole и userId в null,
   * удаляет из cookie accessToken, refrashToken, refrashTokenExpired
   */
  logOut(): void;
}

export default new Store();

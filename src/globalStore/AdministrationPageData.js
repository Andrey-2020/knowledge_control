import { makeAutoObservable, runInAction } from 'mobx';
import { message } from 'antd';

import {
  registerComponent,
  cancelAllComponentRequests,
} from 'plugins/http/cancelableRequests';
import http from 'plugins/http';

/**
 * Хранилище страницы "Администрирование"
 */
export default class AdministrationPageData {
  /** @type {import('DBModels').Faculty[]?} */
  faculties = null;
  /** @type {import('DBModels').Department[]?} */
  departments = null;
  /** @type {import('DBModels').Subject[]?} */
  subjects = null;
  /** @type {import('DBModels').SubjectSemester[]?} */
  subjectSemesters = null;
  /** @type {import('DBModels').StudyGroup[]?} */
  studyGroups = null;

  /** @param {import('globalStore').Store} rootStore */
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.componentUid = registerComponent('globalStore/AdministrationPageData');
    makeAutoObservable(this, {
      rootStore: false,
      componentUid: false,
    }, { autoBind: true });
    window.addEventListener('beforeunload', () => {
      cancelAllComponentRequests(this.componentUid);
    });
  }

  /**
   * Получает факультеты с сервера
   *
   * @async
   * @returns {Promise<import('DBModels').Faculty[]>}
   */
  async getFaculties(forceUpdate=false) {
    if (this.faculties && !forceUpdate) {
      return this.faculties;
    }

    /** @type {import('DBModels').Faculty[]} */
    let response;
    try {
      response = await http.get('/faculty/all', {
        forCancel: { componentUid: this.componentUid }
      });
    } catch (error) {
      http.ifNotCancel((error) => {
        message.error(http.parseError(
          'Не удалось получить список факультетов', error), 5);
      }).call(null, error);
      throw error;
    }
    runInAction(() => {
      this.faculties = response.data;
    });
    return this.faculties;
  }

  /**
   * Получает департаменты с сервера
   *
   * @async
   * @returns {Promise<import('DBModels').Department[]>}
   */
  async getDepartments(forceUpdate=false) {
    if (this.departments && !forceUpdate) {
      return this.departments;
    }

    /** @type {import('DBModels').Department[]} */
    let response;
    try {
      response = await http.get('/department/all', {
        forCancel: { componentUid: this.componentUid }
      });
    } catch (error) {
      http.ifNotCancel((error) => {
        message.error(http.parseError(
          'Не удалось получить список кафедр', error), 5);
      }).call(null, error);
      throw error;
    }
    runInAction(() => {
      this.departments = response.data;
    });
    return this.departments;
  }

  /**
   * Получает предметы с сервера
   *
   * @async
   * @returns {Promise<import('DBModels').Subject[]>}
   */
  async getSubjects(forceUpdate=false) {
    if (this.subjects && !forceUpdate) {
      return this.subjects;
    }

    /** @type {import('DBModels').Subject[]} */
    let response;
    try {
      response = await http.get('/subject/all', {
        forCancel: { componentUid: this.componentUid }
      });
    } catch (error) {
      http.ifNotCancel((error) => {
        message.error(http.parseError(
          'Не удалось получить список предметов', error), 5);
      }).call(null, error);
      throw error;
    }
    runInAction(() => {
      this.subjects = response.data;
    });
    return this.subjects;
  }

  /**
   * Получает семестры с сервера
   *
   * @async
   * @returns {Promise<import('DBModels').SubjectSemester[]>}
   */
  async getSubjectSemesters(forceUpdate=false) {
    if (this.subjectSemesters && !forceUpdate) {
      return this.subjectSemesters;
    }

    /** @type {import('DBModels').SubjectSemester[]} */
    let response;
    try {
      response = await http.get('/subject-semester/all', {
        forCancel: { componentUid: this.componentUid }
      });
    } catch (error) {
      http.ifNotCancel((error) => {
        message.error(http.parseError(
          'Не удалось получить список предметов семестра', error), 5);
      }).call(null, error);
      throw error;
    }
    runInAction(() => {
      this.subjectSemesters = response.data;
    });
    return this.subjectSemesters;
  }

  /**
   * Получает студенческие группы с сервера
   *
   * @async
   * @returns {Promise<import('DBModels').StudyGroup[]>}
   */
  async getStudyGroups(forceUpdate=false) {
    if (this.studyGroups && !forceUpdate) {
      return this.studyGroups;
    }

    /** @type {import('DBModels').StudyGroup[]} */
    let response;
    try {
      response = await http.get('/study-group/list', {
        forCancel: { componentUid: this.componentUid }
      });
    } catch (error) {
      http.ifNotCancel((error) => {
        message.error(http.parseError(
          'Не удалось получить список учебных групп', error), 5);
      }).call(null, error);
      throw error;
    }
    runInAction(() => {
      this.studyGroups = response.data;
    });
    return this.studyGroups;
  }

  logOut() {
    cancelAllComponentRequests(this.componentUid);

    this.faculties = null;
    this.departments = null;
    this.subjects = null;
    this.subjectSemesters = null;
    this.studyGroups = null;
  }
};

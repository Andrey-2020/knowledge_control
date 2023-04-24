import {
  makeAutoObservable,
  reaction,
  runInAction,
} from 'mobx';
import { message } from 'antd';

/* eslint-disable-next-line no-unused-vars */
import { ROLES } from 'globalStore/constants';
import { AsyncState } from 'plugins/mobx/fields';
import http from 'plugins/http';



/** @type {import('DBModels').User} */
const initUserData = {
  id: null,
  role: null,
  login: null,
  email: null,
  phone: null,
  firstName: null,
  lastName: null,
  patronymic: null,
  avatarId: null,
  studyGroupId: null,
  departmentId: null,
  teachingSubjectIds: [],
};

const USER_FIELDS = Object.keys(initUserData);

/**
 * Хранилище данных пользователя
 */
export default class UserData {
  /** @type {number?} */
  id = null;
  /** @type {ROLES?} */
  role = null;
  /** @type {string?} */
  login = null;
  /** @type {string?} */
  email = null;
  /** @type {string?} */
  phone = null;
  /** @type {string?} */
  firstName = null;
  /** @type {string?} */
  lastName = null;
  /** @type {string?} */
  patronymic = null;
  /** @type {number?} */
  avatarId = null;
  /** @type {number?} */
  studyGroupId = null;
  /** @type {number?} */
  departmentId = null;
  /** @type {number[]} */
  teachingSubjectIds = [];

  /** @type {Blob} */
  avatarFile = null;

  /** @type {import('DBModels').StudyGroup?} */
  studyGroup = null;
  /** @type {import('DBModels').Department} */
  department = null;

  /** @type {import('DBModels').Subject[]} */
  subjects = new AsyncState(
    [],
    () => (
      http.get(this.rootStore.userRole === ROLES.USER ? '/subject/learning' : '/subject/teaching', {
        params: { userId: this.rootStore.userId },
        // forCancel: { componentUid: this.cancelableRequests.componentUid },
      })
      .catch(http.ifNotCancel((error) => {
        message.error(http.parseError(
          'Не удалось получить список предметов', error), 5);
        return Promise.reject();
      }))
    ),
    http.returnData,
  );

  studyGroups = new AsyncState(
    [],
    () => (
      http.get('/study-group/teaching', {
        // forCancel: { componentUid: this.cancelableRequests.componentUid },
      })
      .catch(http.ifNotCancel((error) => {
        message.error(http.parseError('Не удалось получить список групп', error), 5);
        return Promise.reject();
      }))
    ),
    http.returnData,
  );

  /** @param {import('globalStore').Store} rootStore */
  constructor(rootStore) {
    /** TODO: сделать запросы отменяемыми */
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false }, { autoBind: true });

    /**
     * Очистка памяти создания URL из объекта,
     * который происходит в @see avatarUrl
     */
    let oldAvatarFile = this.avatarFile;
    reaction(
      () => this.avatarFile,
      () => {
        URL.revokeObjectURL(oldAvatarFile);
        oldAvatarFile = this.avatarFile;
      },
    );
  }

  /**
   * URL объекта avatarFile.
   * Необходимо очищать, очистка в конструкторе
   * 
   * @returns {(string | null)}
   */
  get avatarUrl() {
    if (!this.avatarFile) {
      return null;
    }
    return URL.createObjectURL(this.avatarFile);
  }

  /**
   * Данные текущего пользователя в виде объекта
   * 
   * @returns {import('DBModels').User}
   */
  get userData() {
    return {
      id: this.id,
      role: this.role,
      login: this.login,
      email: this.email,
      phone: this.phone,
      firstName: this.firstName,
      lastName: this.lastName,
      patronymic: this.patronymic,
      studyGroupId: this.studyGroupId,
      departmentId: this.departmentId,
      teachingSubjectIds: this.teachingSubjectIds,
    };
  }

  /**
   * Получает данные текущего пользователя
   * @throws {Error}
   */
  getUserData() {
    if (!this.rootStore.userId) {
      throw new Error('User not Authorized');
    }
    http.get('/user', { params: { id: this.rootStore.userId } })
    .then((response) => {
      this.setData(response.data);
      this.getUserAvatar();
      this.getUserAffiliation();
    })
    .catch((error) => {
      message.error(http.parseError(
        'Не удалось получить данные пользователя', error), 5);
    });
  }

  getUserAvatar() {
    if (!this.avatarId) {
      return;
    }
    http.get('/files', {
      timeout: 0,
      params: { id: this.avatarId },
      responseType: 'blob',
      // forCancel: {
      //   componentUid,
      //   requestUid: fileId,
      // },
    })
    .then((response) => {
      runInAction(() => {
        this.avatarFile = response.data;
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        'Не удалось загрузить аватар пользователя', error), 5);
    }));
  }

  _getStudyGroup() {
    http.get('study-group', {
      params: { id: this.studyGroupId },
      // forCancel: {
      //   componentUid,
      //   requestUid: fileId,
      // },
    })
    .then((response) => {
      runInAction(() => {
        this.studyGroup = response.data;
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        'Не удалось загрузить данные группы', error), 5);
    }));
  }

  _getDepartment() {
    http.get('department/search-by-ids', {
      params: { ids: [this.departmentId] },
      // forCancel: {
      //   componentUid,
      //   requestUid: fileId,
      // },
    })
    .then((response) => {
      runInAction(() => {
        this.department = response.data[0];
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        'Не удалось загрузить данные кафедры', error), 5);
    }));
  }

  /**
   * Получение студенческой группы или кафедры
   */
  getUserAffiliation() {
    if (this.role === ROLES.USER && this.studyGroupId) {
      this._getStudyGroup();
    /** Получение кафедры преподавателя */
    } else if (this.role === ROLES.TEACHER && this.departmentId) {
      this._getDepartment();
    }
  }

  /**
   * Задаёт данные пользователя
   *
   * @param {import('DBModels').User} user
   */
  setData(user) {
    for (const field of USER_FIELDS) {
      if (field in user) {
        this[field] = user[field];
      }
    }
  }

  /** Очистка данных пользователя */
  logOut() {
    for (const field of USER_FIELDS) {
      this[field] = initUserData[field];
    }
    this.avatarFile = null;
    this.studyGroup = null;
    this.department = null;
  }
};

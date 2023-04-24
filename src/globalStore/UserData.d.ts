import {
  User,
  UserFile,
  StudyGroup,
  Department,
  Subject,
} from 'DBModels';
import { ROLES } from 'globalStore/constants';
import {
  LogOut,
  Store,
} from 'globalStore';
import { AsyncState } from 'plugins/mobx/fields';

/**
 * Хранилище данных пользователя
 */
export default class UserData implements LogOut {
  id?: number;
  role?: ROLES;
  login?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  avatarId?: number;
  studyGroupId?: number;
  departmentId?: number;
  teachingSubjectIds: number[];

  avatarFile?: UserFile;
  studyGroup?: StudyGroup;
  department?: Department;

  subjects: AsyncState<Subject[]>;
  studyGroups: AsyncState<StudyGroup[]>;

  constructor(rootStore: Store);

  /**
   * URL объекта avatarFile.
   * Необходимо очищать, очистка в конструкторе
   */
  get avatarUrl(): string | null;

  /**
   * Данные текущего пользователя в виде объекта
   */
  get userData(): User;

  /**
   * Получает данные текущего пользователя
   * @throws {Error}
   */
  getUserData(): void;

  /**
   * Задаёт данные пользователя
   */
  setData(user: User): void;
};

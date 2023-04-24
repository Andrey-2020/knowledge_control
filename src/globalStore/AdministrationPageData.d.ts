import {
  Faculty,
  Department,
  Subject,
  SubjectSemester,
  StudyGroup,
} from 'DBModels';
import {
  LogOut,
  Store,
} from 'globalStore';

/**
 * Хранилище страницы "Администрирование"
 */
export default class AdministrationPageData implements LogOut {
  faculties?: Faculty[];
  departments?: Department[];
  subjects?: Subject[];
  subjectSemesters?: SubjectSemester[];
  studyGroups?: StudyGroup[];

  constructor(rootStore: Store);

  /**
   * Получает факультеты с сервера
   *
   * @async
   */
  async getFaculties(forceUpdate?: boolean): Promise<Faculty[]>;

  /**
   * Получает департаменты с сервера
   *
   * @async
   */
  async getDepartments(forceUpdate?: boolean): Promise<Department[]>;

  /**
   * Получает предметы с сервера
   *
   * @async
   */
  async getSubjects(forceUpdate?: boolean): Promise<Subject[]>;

  /**
   * Получает семестры с сервера
   *
   * @async
   */
  async getSubjectSemesters(forceUpdate?: boolean): Promise<SubjectSemester[]>;

  /**
   * Получает студенческие группы с сервера
   *
   * @async
   */
  async getStudyGroups(forceUpdate?: boolean): Promise<StudyGroup[]>;
};

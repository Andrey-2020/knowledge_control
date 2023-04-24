import {
  ROLES,
  CONTROL_TYPES,
  LITERATURE_TYPES,
  TASK_TYPES,
  QUESTIONS_TYPES,
  USER_CONTACT_TYPES,
} from 'globalStore/constants';
import { ArrayFixedLength } from 'CommonTypes';


export interface UserFile {
  id: number,
  name: string,
  contentType: string,
  contentLength: number,
  userId: number,
  accessLevel: ROLES,
  linkCount: number,
}

export interface Faculty {
  id: number,
  shortName: string,
  fullName: string,
  departmentIds: number[],
}

export interface Department {
  id: number,
  shortName: string,
  fullName: string,
  facultyId: number,
  studyGroupIds: number[],
  subjectIds: number[],
}

export interface Subject {
  id: number,
  name: string,
  decryption: string,
  departmentId: number,
  semesterIds: number[],
  teacherIds?: number[],
  questionIds?: number[],
  themeIds?: number[],
}

export interface SubjectSemester {
  id: number,
  numberOfSemester: number,
  controlType: CONTROL_TYPES,
  hasCourseWork: boolean,
  hasCourseProject: boolean,
  subjectId: number,
  studentGroupIds: number[],
}

export interface StudyGroup {
  id: number,
  code: number,
  groupnumber: number,
  coursenumber: number,
  shortName: string,
  fullName: string,
  yearOfStudyStart: number,
  departmentId?: number,
  studentIds: number[],
  subjectSemesterIds?: number[],
}

export interface User {
  id: number,
  login: string,
  email: string,
  firstName: string,
  lastName: string,
  patronymic: string,
  phone: string,
  studyGroupId?: number,
  departmentId?: number,
  role: ROLES,
  avatarId: number,
}

export interface SchedulePair {
  pair_number: number,
  teacher: string,
  subject: string,
  subgroup: number,
  place: string,
  typeSubject: number,
  info: string,
}

/**
 * 8 пар, которых может и не быть
 */
export declare type ScheduleDay = ArrayFixedLength<SchedulePair?, 8>;

/**
 * 14 дней (2 недели)
 */
export type Schedule = ArrayFixedLength<ScheduleDay, 14>;

export interface Literature {
  id: number,
  authors: string,
  description: string,
  fileIds: number[],
  semesterIds: number[],
  title: string,
  type: LITERATURE_TYPES,
  userId: number,
}

export interface Theme {
  id: number,
  name: string,
  decryption: string,
  attemptNumberInTest: number,
  questionQuantityInTest: number,
  subjectId: number,
  createdAt: number,
  updatedAt: number,
}

export interface PassedTheme {
  ratings: number[],
  theme: Theme,
}

export interface Work {
  id: number,
  userId: number,
  fileIds: number[],
  studentComment: string,
  mark?: string,
  taskId: number,
  teacherComment?: string,
}

export interface Task {
  description: string,
  fileIds: number[],
  id: number,
  semesterIds: number[],
  title: string,
  type: TASK_TYPES,
  userId: number,
  workIds: number[],
}

export interface Question {
  answers: string[],
  fileIds: number[],
  id: number,
  question: string,
  questionType: QUESTIONS_TYPES,
}

export interface UserContact {
  id: number,
  type: USER_CONTACT_TYPES,
  userId: number,
  value: string
}

export interface Journal {
  id: number;
  comment: string;
  createdDate: number;
  lessonDate: number;
  lastModifiedDate: number;
  visits: Visit[];
  studyGroupId: number;
  subjectSemesterId: number;
  teacherId: number;
}

export interface Visit {
  id: number;
  comment: string;
  createdDate: number;
  isVisited: boolean;
  lastModifiedDate: number;
  studentId: number;
  lessonDate: number;
}

export interface ActionType {
  id: number;
  type: string;
}

type Year = number;
type Month = number;
type Day = number;

export interface Action {
  id: number;
  title: string;
  description: string;
  actionDate: [Year, Month, Day];
  actionType: ActionType;
  users: User[];
}

export interface FlexMark {
  studentId: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  visitMark: {
    done: number;
    total: number;
    mark: number;
    ids: null | [];
  };
  taskMark: {
    done: number;
    total: number;
    mark: number;
    ids: null | number[];
  };
  testMark: {
    done: null | number;
    total: null | number;
    mark: number;
    ids: null | number[];
  };
  resultMark: number;
}

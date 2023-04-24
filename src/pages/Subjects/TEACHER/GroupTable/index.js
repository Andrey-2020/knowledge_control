import React, { useState } from 'react';
import {
  Table,
  Select,
  message,
} from 'antd';
import {
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
  reaction,
} from 'mobx';
import { observer } from 'mobx-react';
import max from 'lodash/max';
import intersection from 'lodash/intersection';

import createOptions from 'utils/createOptions';
import createSelector from 'utils/createSelector';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import useOnce from 'utils/useOnce';
import useOnceWithRevoke from 'utils/useOnceWithRevoke';
import { getFullNameFromObject } from 'utils/getFullName';
import http from 'plugins/http';
import BaseState from 'plugins/mobx/BaseState';
import store from 'globalStore';
import {
  SettedState,
  BooleanState,
} from 'plugins/mobx/fields';
import { emptyFunction } from 'utils/empties';
import ShortTaskDescriptionModal from 'pages/Subjects/TEACHER/GroupTable/ShortTaskDescriptionModal';
import StudentWorkView from 'pages/Subjects/TEACHER/GroupTable/StudentWorkView';
import FlexMarkView from 'pages/Subjects/TEACHER/GroupTable/FlexMarkView';


/**
 * Опции в селекторе работ/тестов
 *
 * @type {import('CommonTypes').Options<string>}
 */
const worksOrTestsOptions = [
  {
    value: 'works',
    label: 'Работы',
  },
  {
    value: 'tests',
    label: 'Тесты',
  },
];

/** @extends {BaseState<undefined>} */
class State extends BaseState {
  /** @type {SettedState<number>} */
  selectedStudyGroup = new SettedState();
  /** @type {SettedState<number>} */
  selectedSubject = new SettedState();
  /** @type {SettedState<'works'|'tests'>} */
  worksOrTests = new SettedState('works');

  studyGroupsLoading = new BooleanState(true);
  subjectsLoading = new BooleanState(true);

  /** @type {import('DBModels').User[])} */
  students = [];
  studentsLoading = new BooleanState(false);

  /** @type {import('DBModels').Theme[]} */
  tests = [];
  _getTestsLoading = new BooleanState(false);

  /** @type {import('DBModels').Task[]} */
  tasks = [];
  _getTasksLoading = new BooleanState(false);

  /**
   * @type {{
   *   [studentId: number]: import('utils/createSelector').Selector<import('DBModels').PassedTheme, 'id'>,
   * }}
   */
  studentTests = {};
  _getStudentsTestsLoading = new BooleanState(false);

  /**
   * @type {{
   *   [studentId: number]: {
   *     [taskId: number]: import('DBModels').Work[]
   *   },
   * }}
   */
  studentWorks = {};
  _getStudentsWorksLoading = new BooleanState(false);

  /** @type {import('DBModels').FlexMark[]} */
  flexMarks = [];
  getFlexMarksLoading = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      students: observable.shallow,
      tests: observable.shallow,
      tasks: observable.shallow,
      studentTests: observable.shallow,
      studentWorks: observable.shallow,
      flexMarks: observable.shallow,
      studyGroupsOptions: computed,
      subjectsOptions: computed,
      studyGroupsSelector: computed,
      flexMarksSelector: computed,
      tableLoading: computed,
      testsColumns: computed,
      tasksColumns: computed,
      columns: computed,
      selectedSubjectSemesterId: computed,
      getStudyGroups: action.bound,
      getSubjects: action.bound,
      _getStudents: action.bound,
      createGetStudentsReaction: action.bound,
      _getTests: action.bound,
      _getTasks: action.bound,
      _getTestsOrTasks: action.bound,
      createGetTasksOrTestsReaction: action.bound,
      _getStudentsTests: action.bound,
      _getStudentsWorks: action.bound,
      _getTasksOrTests: action.bound,
      createGetStudentsWorksOrTestsReaction: action.bound,
      getFlexMarks: action.bound,
      createGetFlexMarksReaction: action.bound,
      updateMark: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get subjects() {
    return store.UserData.subjects.value;
  }

  get studyGroups() {
    return store.UserData.studyGroups.value;
  }

  get subjectsOptions() {
    return createOptions(this.subjects, 'id', 'name');
  }

  get studyGroupsOptions() {
    return createOptions(this.studyGroups, 'id', 'shortName');
  }

  get subjectsSelector() {
    return createSelector(this.subjects, 'id');
  }

  get studyGroupsSelector() {
    return createSelector(this.studyGroups, 'id');
  }

  get flexMarksSelector() {
    return createSelector(this.flexMarks, 'studentId');
  }

  get tableLoading() {
    return this.studyGroupsLoading.value ||
      this.subjectsLoading.value ||
      this.studentsLoading.value ||
      this._getTestsLoading.value ||
      this._getTasksLoading.value ||
      this._getStudentsTestsLoading.value ||
      this._getStudentsWorksLoading.value ||
      this.getFlexMarksLoading.value;
  }

  get testsColumns() {
    if (!this.selectedSubject.value) {
      return [{
        key: 'test 0',
        title: 'Предмет не выбран',
      }];
    }
    return this.tests.map((test) => ({
      key: `test ${test.id}`,
      title: test.name,
      render: (_, record) => {
        if (!(
          record.id in this.studentTests &&
          test.id in this.studentTests[record.id] &&
          this.studentTests[record.id][test.id].ratings.length
        )) {
          return 'Решения нiт';
        }
        return this.studentTests[record.id][test.id].ratings.map((rating) => `${rating}%`).join(', ');
      },
    }));
  }

  get tasksColumns() {
    if (!this.selectedSubject.value) {
      return [{
        key: 'task 0',
        title: 'Предмет не выбран',
      }];
    }
    return this.tasks.map((task) => ({
      key: `task ${task.id}`,
      title: () => (
        <>
          {task.title}
          <ShortTaskDescriptionModal task={task}/>
        </>
      ),
      render: (_, record) => {
        if (!(
          record.id in this.studentWorks &&
          task.id in this.studentWorks[record.id] &&
          this.studentWorks[record.id][task.id].length
        )) {
          return 'Попыток не предпринималось';
        }
        return this.studentWorks[record.id][task.id].map((work) => (
          <StudentWorkView
            key={work.id}
            taskTitle={task.title}
            work={work}
            onChangeMark={(mark) => { this.updateMark(record.id, task.id, work.id, mark) }}
          />
        ));
      },
    }));
  }

  get columns() {
    /** @type {import('antd').TableColumnsType<import('DBModels').User>} */
    const columns = [
      {
        key: 'index',
        title: '№',
        width: '50px',
        render: (_, __, index) => index + 1,
      },
      {
        dataIndex: 'student',
        title: 'Список студентов',
        width: '200px',
        render: (_, record) => `${record.lastName} ${record.firstName}`,
      },
      ...(this.worksOrTests.value === 'tests' ?
        this.testsColumns : this.tasksColumns),
      {
        key: 'flexMark',
        width: '275px',
        title: 'Итоговая оценка',
        render: (_, record) => this.flexMarksSelector[record.id] && (
          <FlexMarkView
            key={record.id}
            target={this.flexMarksSelector[record.id]}
          />
        ),
      },
    ];
    return columns;
  }

  get selectedSubjectSemesterId() {
    if (!this.selectedSubject.value || !this.selectedStudyGroup.value) {
      return undefined;
    }
    const subject = this.subjectsSelector[this.selectedSubject.value];
    const studyGroup = this.studyGroupsSelector[this.selectedStudyGroup.value];
    if (!subject || !studyGroup) {
      return undefined;
    }

    return max(intersection(
      subject.semesterIds,
      studyGroup.subjectSemesterIds,
    ));
  }

  getStudyGroups() {
    store.UserData.studyGroups.get()
    .catch(emptyFunction)
    .finally(this.studyGroupsLoading.setFalse);
  }

  getSubjects() {
    store.UserData.subjects.get()
    .catch(emptyFunction)
    .finally(this.subjectsLoading.setFalse);
  }

  _getStudents() {
    const studyGroup = this.studyGroupsSelector[this.selectedStudyGroup.value];
    if (!(studyGroup && studyGroup.studentIds.length)) {
      return;
    }
    this.studentsLoading.value = true;
    http.get('/user/search-by-ids', {
      params: { ids: studyGroup.studentIds },
      forCancel: { componentUid: this.cancelableRequests.componentUid },
    })
    .then((response) => {
      runInAction(() => {
        this.students = response.data;
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        `Не удалось получить список студентов группы "${studyGroup.shortName}"`, error), 5);
    }))
    .finally(this.studentsLoading.setFalse);
  }

  createGetStudentsReaction() {
    return reaction(
      () => this.selectedStudyGroup.value,
      this._getStudents,
    );
  }

  _getTests() {
    this._getTestsLoading.value = true;
    http.get('/api/testing/themes', {
      params: { subj_id: this.selectedSubject.value },
      forCancel: { componentUid: this.cancelableRequests.componentUid },
    })
    .then((response) => {
      runInAction(() => {
        this.tests = response.data;
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        'Не удалось получить списочек тестиков по предметику', error), 5);
    }))
    .finally(this._getTestsLoading.setFalse);
  }

  _getTasks() {
    this._getTasksLoading.value = true;
    http.get('/task/teaching', {
      params: { subjectId: this.selectedSubject.value },
      forCancel: { componentUid: this.cancelableRequests.componentUid },
    })
    .then((response) => {
      runInAction(() => {
        this.tasks = response.data;
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        'Не удалось получить список заданий', error), 5);
    }))
    .finally(this._getTasksLoading.setFalse);
  }

  _getTestsOrTasks() {
    if (!this.selectedSubject.value) {
      return;
    }
    if (this.worksOrTests.value === 'tests') {
      this._getTests();
    } else {
      this._getTasks();
    }
  }

  createGetTasksOrTestsReaction() {
    return reaction(
      () => `${this.worksOrTests.value}|${this.selectedSubject.value}`,
      this._getTestsOrTasks,
    );
  }

  _getStudentsTests() {
    this._getStudentsTestsLoading.value = true;
    /** @type {typeof this.studentTests} */
    const result = {};
    /** Получить сданные тесты каждого студента */
    Promise.all(this.students.map((student) => (
      http.get('/api/testing/test/passed-themes', {
        params: {
          subj_id: this.selectedSubject.value,
          user_id: student.id,
        },
        forCancel: {
          componentUid: this.cancelableRequests.componentUid,
          requestUid: `${this.selectedSubject.value}|${student.id}`,
        },
      })
      .then((response) => {
        result[student.id] = response.data.reduce((_result, passed) => {
          _result[passed.theme.id] = passed;
          return _result;
        }, {});
      })
      .catch(http.ifNotCancel((error) => {
        message.error(http.parseError(
          `Ошибка при получении сделанных тестов студента ${getFullNameFromObject(student, 'инкогнито')}`, error), 5);
      }))
    )))
    .finally(() => {
      runInAction(() => {
        this.studentTests = result;
      });
      this._getStudentsTestsLoading.setFalse();
    });
  }

  _getStudentsWorks() {
    this._getStudentsWorksLoading.value = true;
    /** @type {typeof this.studentWorks} */
    const studentWorks = {};

    http.get('/work/teaching', {
      params: { groupId: this.selectedStudyGroup.value },
      forCancel: { componentUid: this.cancelableRequests.componentUid },
    })
    .then((response) => {
      for (const work of response.data) {
        /** Сортировка работ по id студентов */
        if (!(work.userId in studentWorks)) {
          studentWorks[work.userId] = {};
        }
        /** Сортировка работ студента по заданиям */
        if (!(work.taskId in studentWorks[work.userId])) {
          studentWorks[work.userId][work.taskId] = [];
        }
        studentWorks[work.userId][work.taskId].push(work);
      }

      runInAction(() => {
        this.studentWorks = studentWorks;
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        'Ошибка при получении отправленных работ', error), 5);
    }))
    .finally(this._getStudentsWorksLoading.setFalse);
  }

  _getTasksOrTests() {
    if (!this.selectedSubject.value || !this.selectedStudyGroup.value || !this.students.length) {
      return;
    }
    if (this.worksOrTests.value === 'tests') {
      this._getStudentsTests();
    } else {
      this._getStudentsWorks();
    }
  }

  createGetStudentsWorksOrTestsReaction() {
    return reaction(
      () => `${this.worksOrTests.value}|${this.selectedSubject.value}|${this.selectedStudyGroup.value}|${this.students.length}`,
      this._getTasksOrTests,
    );
  }

  getFlexMarks() {
    if (!this.selectedSubjectSemesterId) {
      return;
    }

    this.getFlexMarksLoading.value = true;
    http.get('/flex-mark/per-user', { params: {
      subjectSemesterId: this.selectedSubjectSemesterId,
      studentGroupId: this.selectedStudyGroup.value,
    }})
    .then((response) => {
      runInAction(() => {
        this.flexMarks = response.data;
      });
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось получить итоговые оценки', error), 5);
    })
    .finally(this.getFlexMarksLoading.setFalse);
  }

  createGetFlexMarksReaction() {
    return reaction(
      () => this.selectedSubjectSemesterId,
      this.getFlexMarks,
    );
  }

  /**
   * @param {number} userId
   * @param {number} taskId
   * @param {number} workId
   * @param {import('./index').Mark} mark
   */
  updateMark(userId, taskId, workId, mark) {
    /** Получить работы пользователя */
    const works = this.studentWorks[userId][taskId];
    /** Найти работу, у которой изменилась оценка, по её id */
    const changedWorkIndex = works.findIndex(({ id }) => id === workId);
    /** Изменить работу с изменённой оценкой */
    works[changedWorkIndex].studentComment = mark.teacherComment;
    works[changedWorkIndex].mark = mark.mark;
    this.getFlexMarks();
  }
}

/** Таблица группы студентов по определённому предмету */
function GroupTable() {
  const state = useState(State.create)[0];
  state.cancelableRequests.componentUid = useCancelableRequests('Subjects/SubjectList/GroupTable')[0];
  useOnce(state.getStudyGroups);
  useOnce(state.getSubjects);
  useOnceWithRevoke(state.createGetStudentsReaction);
  useOnceWithRevoke(state.createGetTasksOrTestsReaction);
  useOnceWithRevoke(state.createGetStudentsWorksOrTestsReaction);
  useOnceWithRevoke(state.createGetFlexMarksReaction);

  return (
    <div className="p-3">
      <div>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Выберите группу"
          loading={state.studyGroupsLoading.value}
          options={state.studyGroupsOptions}
          onChange={state.selectedStudyGroup.set}
        />
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Выберите предмет"
          loading={state.subjectsLoading.value}
          options={state.subjectsOptions}
          onChange={state.selectedSubject.set}
        />
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Работы или тесты"
          value={state.worksOrTests.value}
          options={worksOrTestsOptions}
          onChange={state.worksOrTests.set}
        />
      </div>
      <Table
        bordered
        rowKey="id"
        loading={state.tableLoading}
        columns={state.columns}
        dataSource={state.students}
      />
    </div>
  );
}
export default observer(GroupTable);

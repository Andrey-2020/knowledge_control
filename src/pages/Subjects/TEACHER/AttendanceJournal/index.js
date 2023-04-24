import React, { useState } from 'react';
import {
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
  reaction,
} from 'mobx';
import { observer } from 'mobx-react';
import {
  message,
  Table,
  Select,
  Popover,
  Tooltip,
} from 'antd';
import {
  QuestionCircleOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import intersection from 'lodash/intersection';
import max from 'lodash/max';
import moment from 'moment';

import useOnce from 'utils/useOnce';
import useOnceWithRevoke from 'utils/useOnceWithRevoke';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import createOptions from 'utils/createOptions';
import createSelector from 'utils/createSelector';
import { emptyFunction } from 'utils/empties';
import BaseState from 'plugins/mobx/BaseState';
import { scrollXMaxContent } from 'plugins/antd/componentSettings';
import {
  SettedState,
  BooleanState,
} from 'plugins/mobx/fields';
import http from 'plugins/http';
import store from 'globalStore';
import { JOURNAL_DATE_FORMAT } from 'globalStore/constants';
import AddJournalDaysModal from 'pages/Subjects/TEACHER/AttendanceJournal/AddJournalDaysModal';
import VisitCommentModal from 'pages/Subjects/TEACHER/AttendanceJournal/VisitCommentModal';


/**
 * @param {import('DBModels').Journal} j1
 * @param {import('DBModels').Journal} j2
 * @returns {number}
 */
function sortJournal(j1, j2) {
  return j1.lessonDate - j2.lessonDate;
}

class State extends BaseState {
  /** @type {SettedState<number>} */
  selectedStudyGroup = new SettedState();
  /** @type {SettedState<number>} */
  selectedSubject = new SettedState();

  /** @type {import('DBModels').Journal[]} */
  journal = [];

  /** @type {import('DBModels').User[]} */
  students = [];

  studyGroupsLoading = new BooleanState(true);
  subjectsLoading = new BooleanState(true);
  journalLoading = new BooleanState(false);
  studentsLoading = new BooleanState(false);

  visitCommentModalVisible = new BooleanState(false);
  visitCommentModalComment = new SettedState('');
  visitCommentModalUpdateComment = new SettedState(() => {}, true);

  constructor() {
    super();
    makeObservable(this, {
      journal: observable,
      students: observable.shallow,
      loading: computed,
      subjects: computed,
      studyGroups: computed,
      selectedSubjectSemesterId: computed,
      subjectsOptions: computed,
      studyGroupsOptions: computed,
      subjectsSelector: computed,
      studyGroupsSelector: computed,
      mostPopularComments: computed,
      getSubjects: action.bound,
      getStudyGroups: action.bound,
      getJournal: action.bound,
      getStudents: action.bound,
      createGetJournalReaction: action.bound,
      createGetStudentsReaction: action.bound,
      updateJournal: action.bound,
      changeIsVisited: action.bound,
      putVisitsLikeLastTime: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get loading() {
    return this.studyGroupsLoading.value ||
      this.subjectsLoading.value ||
      this.journalLoading.value ||
      this.studentsLoading.value;
  }

  get subjects() {
    return store.UserData.subjects.value;
  }

  get studyGroups() {
    return store.UserData.studyGroups.value;
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

  get columns() {
    return [
      {
        key: 'index',
        title: '№',
        width: '50px',
        render: (_, __, index) => String(index + 1),
      },
      {
        key: 'student',
        title: 'Список студентов',
        width: '200px',
        render: (_, record) => `${record.lastName} ${record.firstName}`,
      },
      ...this.journal.map((journal, index) => {
        const visitSelector = createSelector(journal.visits, 'studentId');
        /** @type {import('antd').TableColumnType<import('DBModels').User>} */
        const result = {
          key: `journal ${journal.id}`,
          title: (
            <>
              {moment(journal.lessonDate).format(JOURNAL_DATE_FORMAT)}
              <br />
              {index > 0 && (
                <Tooltip title="Поставить посещаемость как в прошлый раз">
                  <LoginOutlined onClick={() => { this.putVisitsLikeLastTime(index); }} />
                </Tooltip>
              )}
            </>
          ),
          onCell: (record) => ({
            /** Если visit'а нет, то значит на момент создания пары ученика не было в группе */
            className: visitSelector[record.id] ?
              (visitSelector[record.id].isVisited ?
                'cursor-pointer success-light-3-bg' : 'cursor-pointer error-light-3-bg'
              ) : 'error-base-bg',
            onClick: visitSelector[record.id] && (() => {
              this.changeIsVisited(journal, visitSelector[record.id]);
            }),
            onContextMenu: visitSelector[record.id] && ((event) => {
              event.preventDefault();
              this.visitCommentModalComment.set(visitSelector[record.id].comment);
              this.visitCommentModalUpdateComment.set((comment) => {
                const initialComment = visitSelector[record.id].comment;
                visitSelector[record.id].comment = comment;
                this.updateJournal(journal)
                .then(this.visitCommentModalVisible.setFalse)
                .catch(() => {
                  visitSelector[record.id].comment = initialComment;
                });
              });
              this.visitCommentModalVisible.setTrue();
            }),
          }),
          render(_, record) {
            return (
              visitSelector[record.id] && visitSelector[record.id].comment
            );
          },
        };
        return result;
      })
    ];
  }
  
  get mostPopularComments() {
    const popularity = {};
    for (const _journal of this.journal) {
      for (const visit of _journal.visits) {
        if (visit.comment) {
          if (popularity[visit.comment]) {
            popularity[visit.comment]++;
          } else {
            popularity[visit.comment] = 1;
          }
        }
      }
    }
    return Object.keys(popularity).sort((p1, p2) => popularity[p2] - popularity[p1]);
  }

  getSubjects() {
    store.UserData.subjects.get()
    .catch(emptyFunction)
    .finally(this.subjectsLoading.setFalse);
  }

  getStudyGroups() {
    store.UserData.studyGroups.get()
    .catch(emptyFunction)
    .finally(this.studyGroupsLoading.setFalse);
  }

  getJournal() {
    if (!this.selectedSubjectSemesterId) {
      return;
    }

    this.journalLoading.value = true;
    Promise.all([
      store.UserData.subjects.get(),
      store.UserData.studyGroups.get(),
    ])
    .catch(emptyFunction)
    .then(() => {
      return http.get('/journal', { params: {
        /*
          Сейчас берётся самый последний семестр.
          Возможно потому следует сделать запрос всех и селектор для нужного.
        */
        semesterId: this.selectedSubjectSemesterId,
        groupId: this.selectedStudyGroup.value,
        pageNumber: 1,
        pageSize: -1,
        // timeAfter: ,
        // timeBefore: ,
      }});
    })
    .then((response) => {
      runInAction(() => {
        this.journal = response.data.journals.sort(sortJournal);
      });
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось получить данные журнала', error), 5);
    })
    .finally(this.journalLoading.setFalse);
  }

  createGetJournalReaction() {
    return reaction(
      () => this.selectedSubjectSemesterId,
      this.getJournal,
    );
  }

  getStudents() {
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
      this.getStudents,
    );
  }


  /**
   * @param {import('DBModels').Journal} journal
   */
  updateJournal(journal) {
    this.journalLoading.value = true;
    return http.put('/journal', journal, {
      params: { id: journal.id },
      // forCancel: { componentUid: this.cancelableRequests.componentUid },
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось обновить журнал', error), 5);
      return Promise.reject();
    })
    .finally(this.journalLoading.setFalse);
  }

  /**
   * @param {import('DBModels').Journal} journal
   * @param {import('DBModels').Visit} visit
   */
  changeIsVisited(journal, visit) {
    visit.isVisited = !visit.isVisited;
    this.updateJournal(journal)
    .catch(() => {
      visit.isVisited = !visit.isVisited;
    });
  }

  putVisitsLikeLastTime(journalIndex) {
    for (let i = 0; i < this.students.length; i++) {
      this.journal[journalIndex].visits[i].isVisited = this.journal[journalIndex - 1].visits[i].isVisited;
    }
    
    this.updateJournal(this.journal[journalIndex])
    .catch(emptyFunction);
  }
}

const helpComponent = (
  <Popover
    content={(
      <>
        ЛКМ - изменение посещаемости
        <br />
        ПКМ - оставление комментария
      </>
    )}
  >
    <QuestionCircleOutlined style={{ fontSize: '24px' }} />
  </Popover>
);

function AttendanceJournal() {
  const state = useState(State.create)[0];
  state.cancelableRequests.componentUid = useCancelableRequests('Subjects/TEACHER/AttendanceJournal')[0];
  useOnce(state.getSubjects);
  useOnce(state.getStudyGroups);
  useOnceWithRevoke(state.createGetJournalReaction);
  useOnceWithRevoke(state.createGetStudentsReaction);

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
        <AddJournalDaysModal
          disabled={!(state.selectedSubjectSemesterId && !state.studentsLoading.value)}
          students={state.students}
          studyGroupId={state.selectedStudyGroup.value}
          subjectSemesterId={state.selectedSubjectSemesterId}
          onJournalChanged={state.getJournal}
        />
        {helpComponent}
        <VisitCommentModal
          visible={state.visitCommentModalVisible}
          comment={state.visitCommentModalComment.value}
          updateComment={state.visitCommentModalUpdateComment.value}
          mostPopularComments={state.mostPopularComments}
        />
      </div>
      <Table
        bordered
        rowKey="id"
        scroll={scrollXMaxContent}
        loading={state.loading}
        columns={state.columns}
        dataSource={state.students}
      />
    </div>
  );
}
export default observer(AttendanceJournal);

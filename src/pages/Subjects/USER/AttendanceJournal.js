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
} from 'antd';
import moment from 'moment';

import useOnce from 'utils/useOnce';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import createOptions from 'utils/createOptions';
import createSelector from 'utils/createSelector';
import {
  emptyFunction,
  emptyArray,
} from 'utils/empties';
import BaseState from 'plugins/mobx/BaseState';
import { scrollXMaxContent } from 'plugins/antd/componentSettings';
import {
  SettedState,
  BooleanState,
} from 'plugins/mobx/fields';
import http from 'plugins/http';
import store from 'globalStore';
import { JOURNAL_DATE_FORMAT } from 'globalStore/constants';
import useOnceWithRevoke from 'utils/useOnceWithRevoke';


/**
 * @param {import('DBModels').Journal} j1
 * @param {import('DBModels').Journal} j2
 * @returns {number}
 */
function sortJournal(j1, j2) {
  return j1.lessonDate - j2.lessonDate;
}

const oneElement = [{ id: 0 }];

class State extends BaseState {
  /** @type {SettedState<number>} */
  selectedSubject = new SettedState();

  /** @type {import('DBModels').Visit[]} */
  journal = [];

  subjectsLoading = new BooleanState(true);
  journalLoading = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      journal: observable,
      loading: computed,
      subjects: computed,
      subjectsOptions: computed,
      subjectsSelector: computed,
      getSubjects: action.bound,
      getJournal: action.bound,
      createGetJournalReaction: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get loading() {
    return this.subjectsLoading.value ||
      this.journalLoading.value;
  }

  get subjects() {
    return store.UserData.subjects.value;
  }

  get subjectsOptions() {
    return createOptions(this.subjects, 'id', 'name');
  }

  get subjectsSelector() {
    return createSelector(this.subjects, 'id');
  }

  get columns() {
    return this.journal.map((visit) => {
      /** @type {import('antd').TableColumnType<import('DBModels').User>} */
      const result = {
        key: `journal ${visit.id}`,
        title: moment(visit.lessonDate).format(JOURNAL_DATE_FORMAT),
        onCell: (record) => ({
          /** Если visit'а нет, то значит на момент создания пары ученика не было в группе */
          className: visit[record.id].isVisited ?
            'cursor-pointer success-light-3-bg' : 'cursor-pointer error-light-3-bg',
          style: {
            height: '150px',
            width: '50px',
          },
        }),
        render() {
          return visit.comment;
        },
      };
      return result;
    });
  }

  getSubjects() {
    store.UserData.subjects.get()
    .catch(emptyFunction)
    .finally(this.subjectsLoading.setFalse);
  }

  getJournal() {
    this.journalLoading.value = true;
    store.UserData.subjects.get()
    .catch(emptyFunction)
    .then(() => {
      return http.get('/journal/per-user', { params: {
        studentId: store.userId,
        subjectId: this.selectedSubject.value,
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
      () => this.selectedSubject.value,
      this.getJournal,
    );
  }
}

function AttendanceJournal() {
  const state = useState(State.create)[0];
  state.cancelableRequests.componentUid = useCancelableRequests('Subjects/USER/AttendanceJournal')[0];
  useOnce(state.getSubjects);
  useOnceWithRevoke(state.createGetJournalReaction);

  return (
    <div className="p-3">
      <div>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Выберите предмет"
          loading={state.subjectsLoading.value}
          options={state.subjectsOptions}
          onChange={state.selectedSubject.set}
        />
      </div>
      <Table
        bordered
        rowKey="id"
        scroll={scrollXMaxContent}
        loading={state.loading}
        columns={state.columns}
        dataSource={state.selectedSubject.value ? oneElement : emptyArray}
      />
    </div>
  );
}
export default observer(AttendanceJournal);

import React, { useState } from 'react';
import {
  Modal,
  Button,
  DatePicker,
  Spin,
  message,
  Divider,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import {
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import sortedIndex from 'lodash/sortedIndex';
import moment from 'moment';

import BaseState from 'plugins/mobx/BaseState';
import { BooleanState } from 'plugins/mobx/fields';
import { JOURNAL_DATE_FORMAT } from 'globalStore/constants';
import store from 'globalStore';
import http from 'plugins/http';


/** @extends {BaseState<import('./AddJournalDaysModal').Props>} */
class State extends BaseState {
  /** @type {import('moment').Moment[]} */
  dates = [];
  /**
   * Для удобного добавления даты хранятся также в числах
   * @type {number[]}
   */
  _dates = [];
  visible = new BooleanState(false);
  loading = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      dates: observable.shallow,
      datesComponents: computed,
      addDateSorted: action.bound,
      removeDate: action.bound,
      removeDuplicates: action.bound,
      add: action.bound,
      clear: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get datesComponents() {
    return this.dates.map((date, index) => (
      <div
        key={index}
        className="d-flex justify-content-between"
      >
        <b>{date.format(JOURNAL_DATE_FORMAT)}</b>
        <DeleteOutlined onClick={() => { this.removeDate(index); }}/>
      </div>
    ));
  }

  /** @param {import('./AddJournalDaysModal').Props} props */
  setProps(props) {
    if (this.props && this.props.subjectSemesterId !== props.subjectSemesterId) {
      this.clear();
    }
    this.props = props;
  }

  /** @param {import('moment').Moment} date */
  addDateSorted(date) {
    const _date = date.valueOf();
    const index = sortedIndex(this._dates, _date);
    this._dates.splice(index, 0, _date);
    this.dates.splice(index, 0, date);
  }

  /** @param {number} index */
  removeDate(index) {
    this._dates.splice(index, 1);
    this.dates.splice(index, 1);
  }

  removeDuplicates() {
    this._dates = [...(new Set(this._dates))];
    this.dates = this._dates.map((_date) => moment(_date));
  }

  add() {
    this.loading.value = true;

    const studentsVisits = this.props.students.map((student) => ({
      comment: '',
      isVisited: false,
      studentId: student.id,
    }));

    Promise.all(this._dates.map((date, index) => (
      http.post('/journal', {
        comment: '',
        subjectSemesterId: this.props.subjectSemesterId,
        studyGroupId: this.props.studyGroupId,
        teacherId: store.userId,
        visits: studentsVisits,
        lessonDate: date,
      })
      .catch((error) => {
        message.error(http.parseError(
          `Не удалось добавить занятие на дату ${this.dates[index].format(JOURNAL_DATE_FORMAT)}`,
          error), 5);
      }))
    ))
    .then(() => {
      this.visible.setFalse();
      this.props.onJournalChanged();
      this.clear();
    })
    .finally(this.loading.setFalse);
  }

  clear() {
    this._dates = [];
    this.dates = [];
  }
}

/** @param {import('./AddJournalDaysModal').Props} props */
function AddJournalDaysModal(props) {
  const state = useState(State.create)[0];
  state.setProps(props);

  return (
    <>
      <Button
        type="primary"
        disabled={props.disabled}
        onClick={state.visible.setTrue}
      >
        Добавить занятия
      </Button>
      <Modal
        footer={null}
        visible={state.visible.value}
        title="Добавление занятий"
        onOk={state.visible.setFalse}
        onCancel={state.visible.setFalse}
      >
        <Spin spinning={state.loading.value}>
          <Button onClick={state.removeDuplicates}>
            Удалить дубликаты
          </Button>
          <div style={{ height: '350px' }}>
            <DatePicker
              open
              placeholder="Выбирайте дни"
              value={null}
              // Это нужно, чтобы лечить баг, когда DatePicker не закрывается при закрытии модалки
              getPopupContainer={(trigger) => trigger}
              onChange={state.addDateSorted}
            />
          </div>
          {state.datesComponents}
          <Divider />
          <Button
            block
            type="primary"
            disabled={!state.dates.length}
            onClick={state.add}
          >
            Добавить
          </Button>
        </Spin>
      </Modal>
    </>
  );
}
export default observer(AddJournalDaysModal);

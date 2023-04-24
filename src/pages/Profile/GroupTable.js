import React, { useState } from 'react';
import {
  message,
  Table,
} from 'antd';
import {
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
} from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import { BooleanState } from 'plugins/mobx/fields';
import http from 'plugins/http';
import useOnce from 'utils/useOnce';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BooleanState<import('./GroupTable').Props>} */
class State extends BaseState {
  students = [];
  loading = new BooleanState(true);

  constructor() {
    super();
    makeObservable(this, {
      students: observable.shallow,
      columns: computed,
      getStudents: action.bound,
    });
  }

  /** @returns {import('./GroupTable').State} */
  static create() {
    return new State();
  }

  get columns() {
    return [
      {
        title: i18n.t('pages.Profile.GroupList:GroupTable.columns.firstName--title'),
        dataIndex: 'firstName',
      },
      {
        title: i18n.t('pages.Profile.GroupList:GroupTable.columns.lastName--title'),
        dataIndex: 'lastName',
      },
      {
        title: i18n.t('pages.Profile.GroupList:GroupTable.columns.patronymic--title'),
        dataIndex: 'patronymic',
      },
      {
        title: i18n.t('pages.Profile.GroupList:GroupTable.columns.login--title'),
        dataIndex: 'login',
      },
      {
        title: i18n.t('pages.Profile.GroupList:GroupTable.columns.email--title'),
        dataIndex: 'email',
      },
      {
        title: i18n.t('pages.Profile.GroupList:GroupTable.columns.phone--title'),
        dataIndex: 'phone',
      },
    ];
  }

  getStudents() {
    http.get('user/search-by-ids', {
      params: { ids: this.props.studentIds },
      forCancel: { componentUid: this.cancelableRequests.componentUid },
    })
    .then((response) => {
      runInAction(() => {
        this.students = response.data;
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        i18n.t('pages.Profile.GroupList:GroupTable.useOnce--get-user-by-ids--error'), error), 5);
    }))
    .finally(this.loading.setFalse);
  }
}

/**
 * Отображения списка студентов одной группы
 * 
 * @param {import('./GroupTable').Props} props
 */
 function GroupTable(props) {
  const state = useState(State.create)[0];
  state.props = props;
  state.cancelableRequests.componentUid = useCancelableRequests(
    `Profile/GroupList/GroupTable(${props.studentIds.join('|')})`
  )[0];

  useOnce(state.getStudents);

  return (
    <Table
      bordered
      rowKey="id"
      loading={state.loading.value}
      columns={state.columns}
      dataSource={state.students}
    />
  );
}
export default observer(GroupTable);

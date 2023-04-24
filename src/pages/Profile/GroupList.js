import React, { useState } from 'react';
import {
  message,
  Collapse,
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
import useOnce from 'utils/useOnce';
import http from 'plugins/http';
import { BooleanState } from 'plugins/mobx/fields';
import GroupTable from 'pages/Profile/GroupTable';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<undefined>} */
class State extends BaseState {
  groups = [];
  loading = new BooleanState(true);

  constructor() {
    super();
    makeObservable(this, {
      groups: observable.shallow,
      groupsComponent: computed,
      component: computed,
      getTeachingStudyGroups: action.bound,
    });
  }

  /** @returns {import('./GroupList').State} */
  static create() {
    return new State();
  }

  get groupsComponent() {
    return this.groups.map((group) => (
      <Collapse.Panel
        key={group.id}
        header={group.shortName}
      >
        <GroupTable studentIds={group.studentIds}/>
      </Collapse.Panel>
    ));
  }

  get component() {
    if (!this.groups.length) {
      return (
        <h4 className="text-center">
          {i18n.t('pages.Profile.GroupList:GroupList.no-studyGroups')}
        </h4>
      );
    }
  
    return (
      <Collapse
        bordered
        header={i18n.t('pages.Profile.GroupList:GroupList.Collapse--header')}
        loading={this.loading.value}
      >
        {this.groupsComponent}
      </Collapse>
    );
  }

  getTeachingStudyGroups() {
    http.get('/study-group/teaching', { forCancel: { componentUid: this.cancelableRequests.componentUid } })
    .then((response) => {
      runInAction(() => {
        this.groups = response.data;
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        i18n.t('pages.Profile.GroupList:GroupList.useOnce--get-studyGroup-teaching--error'), error), 5);
    }))
    .finally(this.loading.setFalse);
  }
}

/**
 * Отображение списка групп студентов
 */
function GroupList() {
  const state = useState(State.create)[0];
  state.cancelableRequests.componentUid = useCancelableRequests('Profile/GroupList')[0];
  useOnce(state.getTeachingStudyGroups);

  return state.component;
}
export default observer(GroupList);

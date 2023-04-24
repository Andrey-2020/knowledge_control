import React, { useState } from 'react';
import {
  Spin,
  List,
} from 'antd';
import { Helmet } from 'react-helmet';
import {
  makeObservable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import useOnce from 'utils/useOnce';
import store from 'globalStore';
import SubjectCard from 'pages/Subjects/SubjectCard';
import BaseState from 'plugins/mobx/BaseState';
import { BooleanState } from 'plugins/mobx/fields';
import { emptyFunction } from 'utils/empties';


const ListGrid = {
  gutter: 24,
  xs: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  xxl: 5
};
/** @param {import('DBModels').Subject} subject */
function SubjectListItem(subject) {
  return (
    <List.Item key={subject.id}>
      <SubjectCard subject={subject}/>
    </List.Item>
  );
}

/** @extends {BaseState<undefined>} */
class State extends BaseState {
  loading = new BooleanState(true);

  constructor() {
    super();
    makeObservable(this, {
      subjects: computed,
      getSubjects: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get subjects() {
    return store.UserData.subjects.value;
  }

  getSubjects() {
    store.UserData.subjects.getForce()
    .catch(emptyFunction)
    .finally(this.loading.setFalse);
  }
}

/**
 * Страница со списком предметов пользователя
 */
function SubjectList() {
  const state = useState(State.create)[0];
  state.cancelableRequests.componentUid = useCancelableRequests('Subjects/SubjectList')[0];
  useOnce(state.getSubjects);

  return (
    <>
      <Helmet>
        <title>Комната с предметами</title>
      </Helmet>
      <div>
        <div className="d-flex justify-content-between">
          <h4>Предметы</h4>
          <div>
            <span className="mr-3">
              Группа: ИВТАПбд-31
            </span>
            <span>5 семестр</span>
          </div>
        </div>
        <Spin spinning={state.loading.value}>
          <List
            grid={ListGrid}
            dataSource={state.subjects}
            renderItem={SubjectListItem}
          />
        </Spin>
      </div>
    </>
  );
}
export default observer(SubjectList);

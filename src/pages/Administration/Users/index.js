import React, { useState } from 'react';
import {
  Spin,
  Table,
  Space,
  Button,
  message,
  AutoComplete,
  Modal,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import useOnce from 'utils/useOnce';
import createOptions from 'utils/createOptions';
import http from 'plugins/http';
import store from 'globalStore';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import { scrollXMaxContent } from 'plugins/antd/componentSettings';
import { roleTranslator } from 'globalStore/constants';
import AddUserModalButton from 'pages/Administration/Users/AddUserModalButton';
import ChangeUserModalButton from 'pages/Administration/Users/ChangeUserModalButton';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<undefined>} */
class State extends BaseState {
  studyGroups = [];
  departments = [];
  users = [];

  loading = new BooleanState(true);
  selected = new SettedState([], true);

  constructor() {
    super();
    makeObservable(this, {
      studyGroups: observable.shallow,
      departments: observable.shallow,
      users: observable.shallow,
      studyGroupsOptions: computed,
      departmentsOptions: computed,
      columns: computed,
      rowSelection: computed,
      setDataSource: action.bound,
      getUsersRequest: action.bound,
      getDataSource: action.bound,
      updateTable: action.bound,
      delete: action.bound,
      deleteSelected: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get studyGroupsOptions() {
    return createOptions(this.studyGroups, 'id', 'shortName');
  }

  get departmentsOptions() {
    return createOptions(this.departments, 'id', 'shortName');
  }

  get columns() {
    return [
      {
        title: i18n.t('pages.Administration.Users.index:columns.login--title'),
        dataIndex: 'login',
      },
      {
        title: i18n.t('pages.Administration.Users.index:columns.email--title'),
        dataIndex: 'email',
      },
      {
        title: i18n.t('pages.Administration.Users.index:columns.firstName--title'),
        dataIndex: 'firstName',
      },
      {
        title: i18n.t('pages.Administration.Users.index:columns.lastName--title'),
        dataIndex: 'lastName',
      },
      {
        title: i18n.t('pages.Administration.Users.index:columns.patronymic--title'),
        dataIndex: 'patronymic',
      },
      {
        title: i18n.t('pages.Administration.Users.index:columns.phone--title'),
        dataIndex: 'phone',
      },
      {
        title: i18n.t('pages.Administration.Users.index:columns.role--title'),
        dataIndex: 'role',
        render: (text) => roleTranslator(text) || `${i18n.t('pages.Administration.Users.index:columns.role--render--undefined')} - ${text}`,
      },
      {
        title: i18n.t('pages.Administration.Users.index:columns.affiliation--title'),
        render: (_, record) => {
          if (record.studyGroupId) {
            const studyGroup = this.studyGroupsOptions.find(({ value }) => value === record.studyGroupId);
            if (studyGroup) {
              return `${i18n.t('pages.Administration.Users.index:columns.affiliation--render--text--studyGroup')} ${studyGroup.label}`;
            }
          } else if (record.departmentId) {
            const department = this.departmentsOptions.find(({ value }) => value === record.departmentId);
            if (department) {
              return `${i18n.t('pages.Administration.Users.index:columns.affiliation--render--text--department')} ${department.label}`;
            }
          }
          return i18n.t('pages.Administration.Users.index:columns.affiliation--render--empty');
        },
      },
      {
        title: i18n.t('pages.Administration.Users.index:columns.actions--title'),
        render: (_, record) => (
          <div className="d-flex justify-content-between">
            <ChangeUserModalButton
              studyGroupsOptions={this.studyGroupsOptions}
              departmentsOptions={this.departmentsOptions}
              changed={record}
              onChange={this.updateTable}
            />
            <Button
              type="danger"
              onClick={() => { this.delete([record.id]); }} 
            >
              {i18n.t('pages.Administration.Users.index:columns.actions--render--delete--text')}
            </Button>
          </div>
        ),
      },
    ];
  }

  get rowSelection() {
    return {
      selectedRowKeys: this.selected.value,
      onChange: this.selected.set,
    };
  }

  setDataSource(data) {
    const studyGroups = data[0],
      departments = data[1],
      users = data[2];
    this.studyGroups = studyGroups;
    this.departments = departments;
    this.users = users;
  }

  getUsersRequest() {
    return http.get('user/list', { forCancel: { componentUid: this.cancelableRequests.componentUid } })
    .then((response) => response.data)
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        'Не удалось получить список пользователей', error), 5);
      return Promise.reject(error);
    }));
  }

  getDataSource() {
    Promise.all([
      store.AdministrationPageData.getStudyGroups(),
      store.AdministrationPageData.getDepartments(),
      this.getUsersRequest(),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  updateTable() {
    this.loading.value = true;
    Promise.all([
      store.AdministrationPageData.getStudyGroups(true),
      store.AdministrationPageData.getDepartments(true),
      this.getUsersRequest(),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  /** @param {number[]} ids */
  delete(ids) {
    Modal.confirm({
      title: i18n.t('pages.Administration.Users.index:remove.title'),
      icon: <ExclamationCircleOutlined/>,
      content: i18n.t('pages.Administration.Users.index:remove.content'),
      okText: i18n.t('pages.Administration.Users.index:remove.okText'),
      cancelText: i18n.t('pages.Administration.Users.index:remove.cancelText'),
      onOk: () => {
        this.loading.setTrue();
        // Потом ids будет передаваться полностью
        http.delete('/user', { params: { id: ids[0] } })
        .then(() => {
          message.success(i18n.t('pages.Administration.Users.index:remove.onOk--success'), 3);
          this.updateTable();
        })
        .catch((error) => {
          message.error(http.parseError(
            i18n.t('pages.Administration.Users.index:remove.onOk--error'), error), 5);
        })
        .finally(this.loading.setFalse);
      },
    });
  }

  deleteSelected() {
    this.delete(this.selected.value);
  }
}

function Index() {
  const { t } = useTranslation(
    'pages.Administration.Users.index',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
  state.cancelableRequests.componentUid = useCancelableRequests('Administration/Users/Index')[0];
  useOnce(state.getDataSource);

  return (
    <Spin spinning={state.loading.value}>
      <div className="mb-3 d-flex">
        <AutoComplete
          className="mr-auto"
          placeholder={t('template.fast-search--placeholder')}
        />
        <Space>
          <Button
            type="danger"
            disabled={!state.selected.value.length}
            onClick={state.deleteSelected}
          >
            {t('template.button-delete-selected--text')}
          </Button>
          <AddUserModalButton
            studyGroupsOptions={state.studyGroupsOptions}
            departmentsOptions={state.departmentsOptions}
            onAdd={state.updateTable}
          />
        </Space>
      </div>
      <Table
        bordered
        rowKey="id"
        scroll={scrollXMaxContent}
        columns={state.columns}
        dataSource={state.users}
        rowSelection={state.rowSelection}
      />
    </Spin>
  );
}
export default observer(Index);

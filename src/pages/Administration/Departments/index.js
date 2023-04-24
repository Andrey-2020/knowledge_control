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
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react';

import http from 'plugins/http';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import { scrollXMaxContent } from 'plugins/antd/componentSettings';
import store from 'globalStore';
import useOnce from 'utils/useOnce';
import createOptions from 'utils/createOptions';
import createSelector from 'utils/createSelector';
import useOnceWithRevoke from 'utils/useOnceWithRevoke';
import AddDepartmentModalButton from 'pages/Administration/Departments/AddDepartmentModalButton';
import ChangeDepartmentModalButton from 'pages/Administration/Departments/ChangeDepartmentModalButton';


class State {
  cachedTranslations = store.Internationalization.cachedTranslations['pages.Administration.Departments.index'];
  faculties = [];
  studyGroups = [];
  subjects = [];
  departments = [];
  loading = new BooleanState(true);
  selected = new SettedState([], true);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  static create() {
    return new State();
  }

  get facultiesOptions() {
    return createOptions(this.faculties, 'id', 'shortName');
  }

  get facultiesSelector() {
    return createSelector(this.faculties, 'id');
  }

  get studyGroupsSelector() {
    return createSelector(this.studyGroups, 'id');
  }

  get subjectsSelector() {
    return createSelector(this.subjects, 'id');
  }

  /** @type {import('antd/lib/table').ColumnsType} */
  get columns() {
    return [
      {
        title: this.cachedTranslations.translations['columns.shortName--title'],
        dataIndex: 'shortName',
      },
      {
        title: this.cachedTranslations.translations['columns.fullName--title'],
        dataIndex: 'fullName',
      },
      {
        title: this.cachedTranslations.translations['columns.facultyId--title'],
        dataIndex: 'facultyId',
        render: (text) => {
          const faculty = this.facultiesSelector[text];
          if (faculty) {
            return faculty.shortName;
          }
          return this.cachedTranslations.translations['columns.facultyId--render--empty'];
        }
      },
      {
        title: this.cachedTranslations.translations['columns.studyGroupIds--title'],
        dataIndex: 'studyGroupIds',
        render: (text) => {
          if (!text || !text.length) {
            return this.cachedTranslations.translations['columns.studyGroupIds--render--empty'];
          }
          return text.map((id) => this.studyGroupsSelector[id].shortName).join(', ');
        },
      },
      {
        title: this.cachedTranslations.translations['columns.subjectIds--title'],
        dataIndex: 'subjectIds',
        render: (text) => {
          if (!text || !text.length) {
            return this.cachedTranslations.translations['columns.subjectIds--render--empty'];
          }
          return text.map((id) => this.subjectsSelector[id].name).join(', ');
        },
      },
      {
        title: this.cachedTranslations.translations['columns.actions--title'],
        render: (_, record) => (
          <div className="d-flex justify-content-between">
            <ChangeDepartmentModalButton
              facultiesOptions={this.facultiesOptions}
              changed={record}
              onChange={this.updateTable}
            />
            <Button
              type="danger"
              onClick={() => { this.delete([record.id]); }}
            >
              {this.cachedTranslations.translations['columns.actions--render--delete--text']}
            </Button>
          </div>
        )
      }
    ];
  }

  get rowSelection() {
    return {
      selectedRowKeys: this.selected.value,
      onChange: this.selected.set,
    };
  }

  setDataSource(data) {
    const faculties = data[0],
      studyGroups = data[1],
      subjects = data[2],
      departments = data[3];
    this.faculties = faculties;
    this.studyGroups = studyGroups;
    this.subjects = subjects;
    this.departments = departments;
  }

  getDataSource() {
    Promise.all([
      store.AdministrationPageData.getFaculties(),
      store.AdministrationPageData.getStudyGroups(),
      store.AdministrationPageData.getSubjects(),
      store.AdministrationPageData.getDepartments(),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  updateTable() {
    this.loading.value = true;
    Promise.all([
      store.AdministrationPageData.getFaculties(true),
      store.AdministrationPageData.getStudyGroups(true),
      store.AdministrationPageData.getSubjects(true),
      store.AdministrationPageData.getDepartments(true),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  /** @param {number[]} ids */
  delete(ids) {
    Modal.confirm({
      title: this.cachedTranslations.translations['remove.title'],
      icon: <ExclamationCircleOutlined/>,
      content: this.cachedTranslations.translations['remove.content'],
      okText: this.cachedTranslations.translations['remove.okText'],
      cancelText: this.cachedTranslations.translations['remove.cancelText'],
      onOk: () => {
        this.loading.setTrue();
        http.delete('/department', { data: ids })
        .then(() => {
          message.success(this.cachedTranslations.translations['remove.onOk--success'], 3);
          this.updateTable();
        })
        .catch((error) => {
          message.error(http.parseError(
            this.cachedTranslations.translations['remove.onOk--error'], error), 5);
        })
        .finally(this.loading.setFalse);
      },
    });
  }

  deleteSelected() {
    this.delete(this.selected);
  }
}

/**
 * Страница CRUD кафедр
 */
function Departments() {
  const state = useState(State.create)[0];
  useOnce(state.getDataSource);
  useOnceWithRevoke(state.cachedTranslations.activateCache);
  
  return (
    <Spin spinning={state.loading.value}>
      <div className="mb-3 d-flex">
        <AutoComplete
          className="mr-auto"
          placeholder={state.cachedTranslations.translations['template.fast-search--placeholder']}
        />
        <Space>
          <Button
            type="danger"
            disabled={!state.selected.value.length}
            onClick={state.deleteSelected}
          >
            {state.cachedTranslations.translations['template.button-delete-selected--text']}
          </Button>
          <AddDepartmentModalButton
            facultiesOptions={state.facultiesOptions}
            onAdd={state.updateTable}
          />
        </Space>
      </div>
      <Table
        bordered
        rowKey="id"
        scroll={scrollXMaxContent}
        columns={state.columns}
        dataSource={state.departments}
        rowSelection={state.rowSelection}
      />
    </Spin>
  );
}
export default observer(Departments);

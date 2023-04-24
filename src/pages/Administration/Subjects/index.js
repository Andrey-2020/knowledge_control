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
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';

import http from 'plugins/http';
import store from 'globalStore';
import useOnce from 'utils/useOnce';
import createOptions from 'utils/createOptions';
import { scrollXMaxContent } from 'plugins/antd/componentSettings';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import AddSubjectModalButton from 'pages/Administration/Subjects/AddSubjectModalButton';
import ChangeSubjectModalButton from 'pages/Administration/Subjects/ChangeSubjectModalButton';


class State {
  subjectSemesters = [];
  departments = [];
  subjects = [];
  // TODO: вопросы

  loading = new BooleanState(true);
  selected = new SettedState([], true);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  static create() {
    return new State();
  }

  get departmentsOptions() {
    return createOptions(this.departments, 'id', 'shortName');
  }

  get columns() {
    return [
      {
        title: i18n.t('pages.Administration.Subjects.index:columns.name--title'),
        dataIndex: 'name',
      },
      {
        title: i18n.t('pages.Administration.Subjects.index:columns.decryption--title'),
        dataIndex: 'decryption',
        width: '255px',
      },
      {
        title: i18n.t('pages.Administration.Subjects.index:columns.departmentId--title'),
        dataIndex: 'departmentId',
        render: (text) => {
          const department = this.departments.find(({ id }) => id === text);
          if (department) {
            return department.shortName;
          }
          return i18n.t('pages.Administration.Subjects.index:columns.departmentId--render--empty');
        }
      },
      {
        title: i18n.t('pages.Administration.Subjects.index:columns.subjectSemesterIds--title'),
        dataIndex: 'subjectSemesterIds',
        render: (text) => {
          if (!text || !text.length) {
            return i18n.t('pages.Administration.Subjects.index:columns.subjectSemesterIds--render--empty');
          }
          return this.subjectSemesters.filter(({ id }) => text.includes(id))
            .map(({ numberOfSemester, studentGroupIds }) => {
              if (!studentGroupIds || !studentGroupIds.length) {
                return `${numberOfSemester} ${i18n.t('pages.Administration.Subjects.index:columns.subjectSemesterIds--render--semester')}`;
              }
              return `${numberOfSemester} ${i18n.t('pages.Administration.Subjects.index:columns.subjectSemesterIds--render--semester')} (${studentGroupIds.map((id) => id).join(', ')})`;
            })
            .join(', ');
        },
      },
      {
        title: i18n.t('pages.Administration.Subjects.index:columns.questionIds--title'),
        dataIndex: 'questionIds',
      },
      {
        title: i18n.t('pages.Administration.Subjects.index:columns.actions--title'),
        render: (_, record) => (
          <div className="d-flex justify-content-between">
            <ChangeSubjectModalButton
              departmentsOptions={this.departmentsOptions}
              changed={record}
              onChange={this.updateTable}
            />
            <Button
              type="danger"
              onClick={() => { this.delete([record.id]); }}
            >
              {i18n.t('pages.Administration.Subjects.index:columns.actions--render--delete--text')}
            </Button>
          </div>
        )
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
    const subjectSemesters = data[0],
      departments = data[1],
      subjects = data[2];
    this.subjectSemesters = subjectSemesters;
    this.departments = departments;
    this.subjects = subjects;
  }

  getDataSource() {
    Promise.all([
      store.AdministrationPageData.getSubjectSemesters(),
      store.AdministrationPageData.getDepartments(),
      store.AdministrationPageData.getSubjects(),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  updateTable() {
    this.loading.value = true;
    Promise.all([
      store.AdministrationPageData.getSubjectSemesters(true),
      store.AdministrationPageData.getDepartments(true),
      store.AdministrationPageData.getSubjects(true),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  /** @param {number[]} ids */
  delete(ids) {
    Modal.confirm({
      title: i18n.t('pages.Administration.Subjects.index:remove.title'),
      icon: <ExclamationCircleOutlined/>,
      content: i18n.t('pages.Administration.Subjects.index:remove.content'),
      okText: i18n.t('pages.Administration.Subjects.index:remove.okText'),
      cancelText: i18n.t('pages.Administration.Subjects.index:remove.cancelText'),
      onOk: () => {
        this.loading.setTrue();
        http.delete('/subject', { data: ids })
        .then(() => {
          message.success(i18n.t('pages.Administration.Subjects.index:remove.onOk--success'), 3);
          this.updateTable();
        })
        .catch((error) => {
          message.error(http.parseError(
            i18n.t('pages.Administration.Subjects.index:remove.onOk--error'), error), 5);
        })
        .finally(this.loading.setFalse);
      },
    });
  }

  deleteSelected() {
    this.delete(this.selected.value);
  }
}

function Subjects() {
  const { t } = useTranslation(
    'pages.Administration.Subjects.index',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
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
          <AddSubjectModalButton
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
        dataSource={state.subjects}
        rowSelection={state.rowSelection}
      />
    </Spin>
  );
}
export default observer(Subjects);

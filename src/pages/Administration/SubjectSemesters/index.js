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
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import { scrollXMaxContent } from 'plugins/antd/componentSettings';
import store from 'globalStore';
import useOnce from 'utils/useOnce';
import createOptions from 'utils/createOptions';
import { controlTypeTranslator } from 'globalStore/constants';
import AddSubjectSemesterModalButton from 'pages/Administration/SubjectSemesters/AddSubjectSemesterModalButton';
import ChangeSubjectSemesterModalButton from 'pages/Administration/SubjectSemesters/ChangeSubjectSemesterModalButton';


class State {
  subjects = [];
  studyGroups = [];
  subjectSemesters = [];

  loading = new BooleanState(true);
  selected = new SettedState([], true);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  static create() {
    return new State();
  }

  get subjectsOptions() {
    return createOptions(this.subjects, 'id', 'name');
  }

  get columns() {
    return [
      {
        title: i18n.t('pages.Administration.SubjectSemesters.index:columns.studyGroupId--title'),
        dataIndex: 'studyGroupId',
        render: (text) => {
          const studyGroup = this.studyGroups.find(({ id }) => id === text);
          if (studyGroup) {
            return studyGroup.shortName;
          }
          return i18n.t('pages.Administration.SubjectSemesters.index:columns.studyGroupId--render--empty');
        },
      },
      {
        title: i18n.t('pages.Administration.SubjectSemesters.index:columns.controlType--title'),
        dataIndex: 'controlType',
        render: (text) => controlTypeTranslator(text) ||
          `${i18n.t('pages.Administration.SubjectSemesters.index:columns.controlType--render--undefined')} - ${text}`,
      },
      {
        title: i18n.t('pages.Administration.SubjectSemesters.index:columns.subjectId--title'),
        dataIndex: 'subjectId',
        render: (text) => {
          const subject = this.subjects.find(({ id }) => id === text);
          if (subject) {
            return subject.name;
          }
          return i18n.t('pages.Administration.SubjectSemesters.index:columns.subjectId--render--empty');
        },
      },
      {
        title: i18n.t('pages.Administration.SubjectSemesters.index:columns.hasCourseWork--title'),
        dataIndex: 'hasCourseWork',
        render: (text) => text ?
          i18n.t('pages.Administration.SubjectSemesters.index:columns.hasCourseWork--render--yes') : i18n.t('pages.Administration.SubjectSemesters.index:columns.hasCourseWork--render--no'),
      },
      {
        title: i18n.t('pages.Administration.SubjectSemesters.index:columns.hasCourseProject--title'),
        dataIndex: 'hasCourseProject',
        render: (text) => text ?
          i18n.t('pages.Administration.SubjectSemesters.index:columns.hasCourseProject--render--yes') : i18n.t('pages.Administration.SubjectSemesters.index:columns.hasCourseProject--render--no'),
      },
      {
        title: i18n.t('pages.Administration.SubjectSemesters.index:columns.actions--title'),
        render: (_, record) => (
          <div className="d-flex justify-content-between">
            <ChangeSubjectSemesterModalButton
              subjectsOptions={this.subjectsOptions}
              changed={record}
              onChange={this.updateTable}
            />
            <Button
              type="danger"
              onClick={() => { this.delete([record.id]); }}
            >
              {i18n.t('pages.Administration.SubjectSemesters.index:columns.actions--render--delete--text')}
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
    const subjects = data[0],
      studyGroups = data[1],
      subjectSemesters = data[2];
    this.subjects = subjects;
    this.studyGroups = studyGroups;
    this.subjectSemesters = subjectSemesters;
  }

  getDataSource() {
    Promise.all([
      store.AdministrationPageData.getSubjects(),
      store.AdministrationPageData.getStudyGroups(),
      store.AdministrationPageData.getSubjectSemesters(),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  updateTable() {
    Promise.all([
      store.AdministrationPageData.getSubjects(true),
      store.AdministrationPageData.getStudyGroups(true),
      store.AdministrationPageData.getSubjectSemesters(true),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  /** @param {number[]} ids */
  delete(ids) {
    Modal.confirm({
      title: i18n.t('pages.Administration.SubjectSemesters.index:remove.title'),
      icon: <ExclamationCircleOutlined/>,
      content: i18n.t('pages.Administration.SubjectSemesters.index:remove.content'),
      okText: i18n.t('pages.Administration.SubjectSemesters.index:remove.okText'),
      cancelText: i18n.t('pages.Administration.SubjectSemesters.index:remove.cancelText'),
      onOk: () => {
        this.loading.setTrue();
        http.delete('/subject-semester', { data: ids })
        .then(() => {
          message.success(i18n.t('pages.Administration.SubjectSemesters.index:remove.onOk--success'), 3);
          this.updateTable();
        })
        .catch((error) => {
          message.error(http.parseError(
            i18n.t('pages.Administration.SubjectSemesters.index:remove.onOk--error'), error), 5);
        })
        .finally(this.loading.setFalse);
      },
    });
  }

  deleteSelected() {
    this.delete(this.selected.value);
  }
}
  
function SubjectSemesters() {
  const { t } = useTranslation(
    'pages.Administration.SubjectSemesters.index',
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
          <AddSubjectSemesterModalButton
            subjectsOptions={state.subjectsOptions}
            onAdd={state.updateTable}
          />
        </Space>
      </div>
      <Table
        bordered
        rowKey="id"
        scroll={scrollXMaxContent}
        columns={state.columns}
        dataSource={state.subjectSemesters}
        rowSelection={state.rowSelection}
      />
    </Spin>
  );
}
export default observer(SubjectSemesters);

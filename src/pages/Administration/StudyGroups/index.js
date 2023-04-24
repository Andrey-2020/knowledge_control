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
import AddStudyGroupModalButton from 'pages/Administration/StudyGroups/AddStudyGroupModalButton';
import ChangeStudyGroupModalButton from 'pages/Administration/StudyGroups/ChangeStudyGroupModalButton';


class State {
  departments = [];
  subjectSemesters = [];
  studyGroups = [];
  loading = new BooleanState(false);
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
        title: i18n.t('pages.Administration.StudyGroups.index:columns.shortName--title'),
        dataIndex: 'shortName',
      },
      {
        title: i18n.t('pages.Administration.StudyGroups.index:columns.fullName--title'),
        dataIndex: 'fullName',
      },
      {
        title: i18n.t('pages.Administration.StudyGroups.index:columns.code--title'),
        dataIndex: 'code',
      },
      {
        title: i18n.t('pages.Administration.StudyGroups.index:columns.groupNumber--title'),
        dataIndex: 'groupNumber',
      },
      {
        title: i18n.t('pages.Administration.StudyGroups.index:columns.numberOfSemester--title'),
        dataIndex: 'numberOfSemester',
      },
      {
        title: i18n.t('pages.Administration.StudyGroups.index:columns.yearOfStudyStart--title'),
        dataIndex: 'yearOfStudyStart',
        render: (text) => {
          if (!text && typeof text !== 'string') {
            return i18n.t('pages.Administration.StudyGroups.index:columns.yearOfStudyStart--render--undefined');
          }
          return `${text} ${i18n.t('pages.Administration.StudyGroups.index:columns.yearOfStudyStart--render--text')}`;
        },
      },
      {
        title: i18n.t('pages.Administration.StudyGroups.index:columns.departmentId--title'),
        dataIndex: 'departmentId',
        render: (text) => {
          if (!text) {
            return i18n.t('pages.Administration.StudyGroups.index:columns.departmentId--render--empty');
          }
          const department = this.departmentsOptions.find(({ value }) => value === text);
          if (department) {
            return department.label;
          }
          return `${i18n.t('pages.Administration.StudyGroups.index:columns.departmentId--render--undefined')}${text}`;
        }
      },
      {
        title: i18n.t('pages.Administration.StudyGroups.index:columns.studentIds--title'),
        dataIndex: 'studentIds',
        render: (_) => 'Студенты',
      },
      {
        title: i18n.t('pages.Administration.StudyGroups.index:columns.subjectSemesters--title'),
        dataIndex: 'subjectSemesters',
        render: (text) => {
          if (!text || !text.length) {
            return i18n.t('pages.Administration.StudyGroups.index:columns.subjectSemesters--render--empty');
          }
          return this.subjectSemesters.filter(({ id }) => text.includes(id))
            .map(({ id, numberOfSemester }) => `${numberOfSemester}(${id})`)
            .join(', ');
        },
      },
      {
        title: i18n.t('pages.Administration.StudyGroups.index:columns.actions--title'),
        render: (_, record) => (
          <div className="d-flex justify-content-between">
            <ChangeStudyGroupModalButton
              departmentsOptions={this.departmentsOptions}
              changed={record}
              onChange={this.updateTable}
            />
            <Button
              type="danger"
              onClick={() => { this.delete([record.id]); }}
            >
              {i18n.t('pages.Administration.StudyGroups.index:columns.actions--render--delete--text')}
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
    const departments = data[0],
      subjectSemesters = data[1],
      studyGroups = data[2];
    this.departments = departments;
    this.subjectSemesters = subjectSemesters;
    this.studyGroups = studyGroups;
  }

  getDataSource() {
    Promise.all([
      store.AdministrationPageData.getDepartments(),
      store.AdministrationPageData.getSubjectSemesters(),
      store.AdministrationPageData.getStudyGroups(),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  updateTable() {
    this.loading.value = true;
    Promise.all([
      store.AdministrationPageData.getDepartments(true),
      store.AdministrationPageData.getSubjectSemesters(true),
      store.AdministrationPageData.getStudyGroups(true),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  /** @param {number[]} ids */
  delete(ids) {
    Modal.confirm({
      title: i18n.t('pages.Administration.StudyGroups.index:remove.title'),
      icon: <ExclamationCircleOutlined/>,
      content: i18n.t('pages.Administration.StudyGroups.index:remove.content'),
      okText: i18n.t('pages.Administration.StudyGroups.index:remove.okText'),
      cancelText: i18n.t('pages.Administration.StudyGroups.index:remove.cancelText'),
      onOk: () => {
        message.info(
          `А удаления пока нет, но мы сделаем вид, что |${ids.join(', ')}| удалились успешно`,
          3,
        );
        return;
        /* eslint-disable-next-line no-unreachable */
        this.loading.setTrue();
        http.delete('/study-group', { data: ids })
        .then(() => {
          message.success(i18n.t('pages.Administration.StudyGroups.index:remove.onOk--success'), 3);
          this.updateTable();
        })
        .catch((error) => {
          message.error(http.parseError(
            i18n.t('pages.Administration.StudyGroups.index:remove.onOk--error'), error), 5);
        })
        .finally(this.loading.setFalse);
      },
    });
  }

  deleteSelected() {
    this.delete(this.selected.value);
  }

  updateSchedule() {
    http.post('schedule/update')
    .then(() => {
      message.success(i18n.t('pages.Administration.StudyGroups.index:updateSchedule--success'), 3);
    })
    .catch((error) => {
      message.error(http.parseError(
        i18n.t('pages.Administration.StudyGroups.index:updateSchedule--error'), error), 5);
    });
  }
}

function StudyGroups() {
  const { t } = useTranslation(
    'pages.Administration.StudyGroups.index',
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
          <Button onClick={state.updateSchedule}>
            {t('template.button-update-schedule--text')}
          </Button>
          <Button
            type="danger"
            disabled={!state.selected.value.length}
            onClick={state.deleteSelected}
          >
            {t('template.button-delete-selected--text')}
          </Button>
          <AddStudyGroupModalButton
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
        dataSource={state.studyGroups}
        rowSelection={state.rowSelection}
      />
    </Spin>
  );
}
export default observer(StudyGroups);

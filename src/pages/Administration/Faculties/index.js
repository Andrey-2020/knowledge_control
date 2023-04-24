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
import store from 'globalStore';
import { scrollXMaxContent } from 'plugins/antd/componentSettings';
import useOnce from 'utils/useOnce';
import createSelector from 'utils/createSelector';
import AddFacultyModalButton from 'pages/Administration/Faculties/AddFacultyModalButton';
import ChangeFacultyModalButton from 'pages/Administration/Faculties/ChangeFacultyModalButton';


class State {
  departments = [];
  faculties = [];
  loading = new BooleanState(true);
  selected = new SettedState([], true);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  static create() {
    return new State();
  }

  get departmentsSelector() {
    return createSelector(this.departments, 'id');
  }

  get columns() {
    return [
      {
        title: i18n.t('pages.Administration.Faculties.index:columns.shortName--title'),
        dataIndex: 'shortName',
      },
      {
        title: i18n.t('pages.Administration.Faculties.index:columns.fullName--title'),
        dataIndex: 'fullName',
      },
      {
        title: i18n.t('pages.Administration.Faculties.index:columns.departmentIds--title'),
        dataIndex: 'departmentIds',
        render: (text) => {
          if (!text || !text.length) {
            return i18n.t('pages.Administration.Faculties.index:columns.departmentIds--render--empty');
          }
          return text.map((id) => this.departmentsSelector[id].shortName).join(', ');
        },
      },
      {
        title: i18n.t('pages.Administration.Faculties.index:columns.actions--title'),
        render: (_, record) => (
          <div className="d-flex justify-content-between">
            <ChangeFacultyModalButton
              changed={record}
              onChange={this.updateTable}
            />
            <Button
              type="danger"
              onClick={() => { this.delete([record.id]); }}
            >
              {i18n.t('pages.Administration.Faculties.index:columns.actions--render--delete--text')}
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
      faculties = data[1];
    this.departments = departments;
    this.faculties = faculties;
  }

  getDataSource() {
    Promise.all([
      store.AdministrationPageData.getDepartments(),
      store.AdministrationPageData.getFaculties(),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  updateTable() {
    this.loading.value = true;
    Promise.all([
      store.AdministrationPageData.getDepartments(true),
      store.AdministrationPageData.getFaculties(true),
    ])
    .then(this.setDataSource)
    .finally(this.loading.setFalse);
  }

  /** @param {number[]} */
  delete(ids) {
    Modal.confirm({
      title: i18n.t('pages.Administration.Faculties.index:remove.title'),
      icon: <ExclamationCircleOutlined/>,
      content: i18n.t('pages.Administration.Faculties.index:remove.content'),
      okText: i18n.t('pages.Administration.Faculties.index:remove.okText'),
      cancelText: i18n.t('pages.Administration.Faculties.index:remove.cancelText'),
      onOk: () => {
        this.loading.setTrue();
        http.delete('/faculty', { data: ids })
        .then(() => {
          message.success(i18n.t('pages.Administration.Faculties.index:remove.onOk--success'), 3);
          this.updateTable();
        })
        .catch((error) => {
          message.error(http.parseError(
            i18n.t('pages.Administration.Faculties.index:remove.onOk--error'), error), 5);
        })
        .finally(this.loading.setFalse);
      },
    });
  }

  deleteSelected() {
    this.delete(this.selected.value);
  }
}

function Faculties() {
  const { t } = useTranslation(
    'pages.Administration.Faculties.index',
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
          <AddFacultyModalButton onAdd={state.updateTable}/>
        </Space>
      </div>
      <Table
        bordered
        rowKey="id"
        scroll={scrollXMaxContent}
        columns={state.columns}
        dataSource={state.faculties}
        rowSelection={state.rowSelection}
      />
    </Spin>
  );
}
export default observer(Faculties);

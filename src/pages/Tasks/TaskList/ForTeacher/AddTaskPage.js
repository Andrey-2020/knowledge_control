import React, { useState } from 'react';
import {
  Spin,
  Form,
  Input,
  Button,
  message,
  Select,
} from 'antd';
import {
  makeObservable,
  observable,
  action,
} from 'mobx';
import { observer } from 'mobx-react';

import {
  required,
  maxLength,
} from 'utils/formRules';
import {
  TASK_TYPES,
  taskTypeTranslatorOptions,
} from 'globalStore/constants';
import eventBus from 'plugins/eventBus';
import http from 'plugins/http';
import store from 'globalStore';
import FilesLoader, { onChangeArgsDefault } from 'components/FilesLoader';
import BaseState from 'plugins/mobx/BaseState';
import {
  SettedState,
  BooleanState,
} from 'plugins/mobx/fields';


/** @extends {BaseState<undefined>} */
class State extends BaseState {
  /** @type {SettedState<import('components/FilesLoader').onChangeArgs>} */
  filesLoaderComponentReset = new SettedState(null, true);

  files = new SettedState(onChangeArgsDefault(), true);

  loading = new BooleanState(false);

  rules = {
    studyGroupId: [required.studyGroupId],
    title: [
      required.name,
      maxLength.standard,
    ],
    type: [required.type],
    description: [maxLength.standard],
  };

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      add: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /** @param {import('./AddTaskPage').FormData} formData */
  add(formData) {
    if (this.files.value.unloaded) {
      message.warning('Имеются неззагруженные файлы', 3);
      return;
    }
    const studyGroupIds = formData.studyGroupIds;
    delete formData.studyGroupIds;

    this.loading.value = true;
    http.post('/task', {
      ...formData,
      semesterIds: studyGroupIds.map((id) =>
        store.studyGroupsData.studyGroupSemesterRef.studyGroupToSemester[id]
      ),
      /** Файлы загружаются вне формы */
      fileIds: this.files.value.loaded,
    })
    .then(() => {
      message.success('Задание успешно добавлено', 3);
      this.formInstance.resetFields();
      this.filesLoaderComponentReset.value();
      eventBus.emit('Tasks/TaskList/ForTeacher/AddTaskForm:add');
    })
    .catch((error) => {
      message.error(http.parseError(
        'Не удалось добавить задание', error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/** Форма добавления задания */
function AddTaskPage() {
  const state = useState(State.create)[0];
  state.formInstance = Form.useForm()[0];

  return (
    <Spin spinning={state.loading.value}>
      <Form
        layout="vertical"
        form={state.formInstance}
        onFinish={state.add}
      >
        <Form.Item
          label="Учебные группы:"
          name="studyGroupIds"
          rules={state.rules.studyGroupId}
        >
          <Select
            showSearch
            mode="multiple"
            placeholder="Учебные группы"
            options={store.studyGroupsData.studyGroupsOptions.get()}
          />
        </Form.Item>
        <Form.Item
          label="Название:"
          name="title"
          rules={state.rules.title}
        >
          <Input placeholder="Название"/>
        </Form.Item>
        <Form.Item
          label="Тип задания:"
          name="type"
          rules={state.rules.type}
          initialValue={TASK_TYPES.LAB}
        >
          <Select options={taskTypeTranslatorOptions()}/>
        </Form.Item>
        <Form.Item
          label="Описание:"
          name="description"
          rules={state.rules.description}
        >
          <Input.TextArea placeholder="Описание"/>
        </Form.Item>
        <Form.Item label="Файлы:">
          <FilesLoader
            componentReset={state.filesLoaderComponentReset.set}
            onChange={state.files.set}
          />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
        >
          Добавить
        </Button>
      </Form>
    </Spin>
  );
}
export default observer(AddTaskPage);

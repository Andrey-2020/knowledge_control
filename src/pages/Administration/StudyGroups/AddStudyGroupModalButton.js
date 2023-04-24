import React, { useState } from 'react';
import {
  Spin,
  Modal,
  Form,
  Input,
  Button,
  message,
  Select,
  InputNumber,
  Radio,
  DatePicker,
} from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import {
  makeObservable,
  observable,
  action,
} from 'mobx';
import i18n from 'i18next';

import {
  maxLength,
  required,
} from 'utils/formRules';
import { COURSE_NUMBERS_OPTIONS } from 'globalStore/constants';
import http from 'plugins/http';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<import('./AddStudyGroupModalButton').Props>} */
class State extends BaseState {
  rules = {
    shortName: [
      required.shortName,
      maxLength.standard,
    ],
    fullName: [
      required.fullName,
      maxLength.standard,
    ],
    code: [required.code],
    groupNumber: [required.groupNumber],
    numberOfSemester: [required.numberOfSemester],
    yearOfStudyStart: [required.yearOfStudyStart],
    departmentId: [required.departmentId],
  };
  visible = new BooleanState(false);
  loading = new BooleanState(false);
  yearOfStudyStartInitial = moment();

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

  /**
   * @param {import('./AddStudyGroupModalButton').FormData} formData
   */
  add(formData) {
    formData.yearOfStudyStart = formData.yearOfStudyStart.year();
    this.loading.value = true;
    http.post('/study-group', formData)
    .then(() => {
      this.visible.setFalse();
      this.props.onAdd();
      message.success(i18n.t('pages.Administration.StudyGroups.AddStudyGroupModalButton:add--success'), 3);
      this.formInstance.resetFields();
    })
    .catch((error) => {
      message.error(http.parseError(
        i18n.t('pages.Administration.StudyGroups.AddStudyGroupModalButton:add--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/**
 * Модальное окно добавления факультета
 *
 * @param {import('./AddStudyGroupModalButton').Props} props
 */
function AddStudyGroupModalButton(props) {
  const { t } = useTranslation(
    'pages.Administration.StudyGroups.AddStudyGroupModalButton',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
  state.props = props;
  state.formInstance = Form.useForm()[0];

  return (
    <>
      <Button
        type="primary"
        onClick={state.visible.setTrue}
      >
        {t('template.show-button--text')}
      </Button>
      <Modal
        footer={null}
        visible={state.visible.value}
        title={t('template.Modal--title')}
        onOk={state.visible.setFalse}
        onCancel={state.visible.setFalse}
      >
        <Spin spinning={state.loading.value}>
          <Form
            layout="vertical"
            form={state.formInstance}
            onFinish={state.add}
          >
            <Form.Item
              name="shortName"
              label={t('template.Form.shortName--label')}
              rules={state.rules.shortName}
            >
              <Input placeholder={t('template.Form.shortName--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="fullName"
              label={t('template.Form.fullName--label')}
              rules={state.rules.fullName}
            >
              <Input placeholder={t('template.Form.fullName--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="code"
              label={t('template.Form.code--label')}
              rules={state.rules.code}
            >
              <InputNumber
                placeholder={t('template.Form.code--placeholder')}
                min={1}
              />
            </Form.Item>
            <Form.Item
              name="groupNumber"
              label={t('template.Form.groupNumber--label')}
              rules={state.rules.groupNumber}
              initialValue={1}
            >
              <InputNumber
                placeholder={t('template.Form.groupNumber--placeholder')}
                min={1}
              />
            </Form.Item>
            <Form.Item
              name="numberOfSemester"
              label={t('template.Form.numberOfSemester--label')}
              rules={state.rules.numberOfSemester}
              initialValue={1}
            >
              <Radio.Group
                optionType="button"
                options={COURSE_NUMBERS_OPTIONS}
              />
            </Form.Item>
            <Form.Item
              name="yearOfStudyStart"
              label={t('template.Form.yearOfStudyStart--label')}
              rules={state.rules.yearOfStudyStart}
              initialValue={state.yearOfStudyStartInitial}
            >
              <DatePicker
                picker="year"
                placeholder={t('template.Form.yearOfStudyStart--placeholder')}
              />
            </Form.Item>
            <Form.Item
              name="departmentId"
              label={t('template.Form.departmentId--label')}
              rules={state.rules.departmentId}
            >
              <Select
                allowClear
                placeholder={t('template.Form.departmentId--placeholder')}
                options={props.departmentsOptions}
              />
            </Form.Item>
            <Button
              className="w-100"
              size="large"
              type="primary"
              htmlType="submit"
            >
              {t('template.Form.submit--text')}
            </Button>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}
export default observer(AddStudyGroupModalButton);

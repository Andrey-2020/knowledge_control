import React, { useState } from 'react';
import {
  Spin,
  Modal,
  Form,
  Checkbox,
  Button,
  message,
  Select,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  makeObservable,
  observable,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';

import { required } from 'utils/formRules';
import http from 'plugins/http';
import {
  /* eslint-disable-next-line no-unused-vars */
  CONTROL_TYPES,
  controlTypeTranslatorOptions,
} from 'globalStore/constants';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<import('./ChangeSubjectSemesterModalButton').Props>} */
class State extends BaseState {
  rules = {
    numberOfSemester: [],
    controlType: [required.controlType],
    hasCourseProject: [],
    hasCourseWork: [],
    subjectId: [],
  };
  visible = new BooleanState(false);
  loading = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      change: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /**
   * @param {import('./ChangeSubjectSemesterModalButton').FormData} formData
   */
  change(formData) {
    this.loading.value = true;
    http.patch('/subject-semester', {}, { params: {
      ...this.props.changed,
      ...formData,
    }})
    .then(() => {
      this.visible.setFalse();
      this.props.onChange();
      message.success(i18n.t('pages.Administration.SubjectSemesters.ChangeSubjectSemesterModalButton:add--success'), 3);
      this.formInstance.resetFields();
    })
    .catch((error) => {
      message.error(http.parseError(
        i18n.t('pages.Administration.SubjectSemesters.ChangeSubjectSemesterModalButton:add--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/**
 * Модальное окно редактирования кафедры
 *
 * @param {import('./ChangeSubjectSemesterModalButton').Props} props
 */
function ChangeSubjectSemesterModalButton(props) {
  const { t } = useTranslation(
    'pages.Administration.SubjectSemesters.ChangeSubjectSemesterModalButton',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
  state.props = props;
  state.formInstance = Form.useForm()[0];

  return (
    <>
      <Button onClick={state.visible.setTrue}>
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
            initialValues={props.changed}
            onFinish={state.change}
          >
            <Form.Item
              name="controlType"
              label={t('template.Form.controlType--label')}
              rules={state.rules.controlType}
            >
              <Select options={controlTypeTranslatorOptions()}/>
            </Form.Item>
            <Form.Item
              name="hasCourseWork"
              valuePropName="checked"
              rules={state.rules.hasCourseWork}
            >
              <Checkbox>
                {t('template.Form.hasCourseWork--label')}
              </Checkbox>
            </Form.Item>
            <Form.Item
              name="hasCourseProject"
              valuePropName="checked"
              rules={state.rules.hasCourseProject}
            >
              <Checkbox>
                {t('template.Form.hasCourseProject--label')}
              </Checkbox>
            </Form.Item>
            <Form.Item
              name="subjectId"
              label={t('template.Form.subjectId--label')}
              rules={state.rules.subjectId}
            >
              <Select
                allowClear
                placeholder={t('template.Form.subjectId--placeholder')}
                options={props.subjectsOptions}
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
export default observer(ChangeSubjectSemesterModalButton);

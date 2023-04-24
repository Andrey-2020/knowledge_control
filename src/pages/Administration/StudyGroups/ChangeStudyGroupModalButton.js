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
  required,
  maxLength,
} from 'utils/formRules';
import { COURSE_NUMBERS_OPTIONS } from 'globalStore/constants';
import http from 'plugins/http';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<import('./ChangeStudyGroupModalButton').Props>} */
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
  yearOfStudyStartInitial = null;

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      yearOfStudyStartInitial: observable.ref,
      setProps: action,
      change: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /** @type {import('./ChangeStudyGroupModalButton').Props} */
  setProps(props) {
    this.props = props;
    if (
      !this.props || (this.props &&
        this.props.changed.yearOfStudyStart !== props.changed.yearOfStudyStart)
    ) {
      this.yearOfStudyStartInitial = moment().year(props.changed.yearOfStudyStart);
    }
  }

  /**
   * @param {import('./AddStudyGroupModalButton').FormData} formData
   */
  change(formData) {
    message.info('Редактирования пока нет, но мы сделаем вид, что всё отредактировалось', 3);
    return;
    /* eslint-disable-next-line no-unreachable */
    formData.yearOfStudyStart = formData.yearOfStudyStart.year();
    this.loading.value = true;
    http.put('/study-group', {}, { params: {
      ...this.props.changed,
      ...formData,
    }})
    .then(() => {
      this.visible.setFalse();
      this.props.onChange();
      message.success(i18n.t('pages.Administration.StudyGroups.ChangeStudyGroupModalButton:change--success'), 3);
    })
    .catch((error) => {
      message.error(http.parseError(
        i18n.t('pages.Administration.StudyGroups.ChangeStudyGroupModalButton:change--error'), error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/**
 * Модальное окно редактирования кафедры
 *
 * @param {Props} props
 */
function ChangeStudyGroupModalButton(props) {
  const { t } = useTranslation(
    'pages.Administration.StudyGroups.ChangeStudyGroupModalButton',
    { useSuspense: false },
  );

  const state = useState(State.create)[0];
  state.setProps(props);
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
            onFinish={state.change}
          >
            <Form.Item
              name="shortName"
              label={t('template.Form.shortName--label')}
              rules={state.rules.shortName}
              initialValue={props.changed.shortName}
            >
              <Input placeholder={t('template.Form.shortName--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="fullName"
              label={t('template.Form.fullName--label')}
              rules={state.rules.fullName}
              initialValue={props.changed.fullName}
            >
              <Input placeholder={t('template.Form.fullName--placeholder')}/>
            </Form.Item>
            <Form.Item
              name="code"
              label={t('template.Form.code--label')}
              rules={state.rules.code}
              initialValue={props.changed.code}
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
              initialValue={props.changed.groupNumber}
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
              initialValue={props.changed.numberOfSemester}
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
              initialValue={props.changed.departmentId}
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
export default observer(ChangeStudyGroupModalButton);

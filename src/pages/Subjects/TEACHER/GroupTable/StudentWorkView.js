import React, { useState } from 'react';
import {
  Button,
  Select,
  message,
  Spin,
  Tag,
  Modal,
  Divider,
  Form,
  Input,
} from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import {
  makeObservable,
  observable,
  action,
} from 'mobx';
import { observer } from 'mobx-react';

import { maxLength } from 'utils/formRules';
import http from 'plugins/http';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';
import {
  MARK_TYPES,
  markTypeTranslator,
  markTypeTranslatorOptionsExtended,
  MARK_TYPE_DISAPPOINTINGLY,
} from 'globalStore/constants';
import FilesView from 'components/FilesView';


/** @extends {BaseState<import('./StudentWorkView').Props>} */
class State extends BaseState {
  visible = new BooleanState(false);
  loading = new BooleanState(false);
  /** @type {import('CommonTypes').FormRules} */
  rules = {
    teacherComment: [maxLength.standard],
  };

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      setMark: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /** @param {import('.').Mark} mark */
  setMark(mark) {
    if (mark.mark === MARK_TYPE_DISAPPOINTINGLY) {
      mark.mark = MARK_TYPES.UNSATISFACTORILY;
    }
    this.loading.value = true;
    http.put('/work', {
      ...this.props.work, // Временно
      ...mark,
    }, {
      params: { id: this.props.work.id },
    })
    .then(() => {
      this.visible.setFalse();
      this.props.onChangeMark(mark);
      message.success('Оценка поставлена', 3);
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось поставить оценку', error), 5);
    })
    .finally(this.loading.setFalse);
  }
}

/**
 * Цвета тегов оценок
 */
const MARK_COLORS = {
  [MARK_TYPES.FIVE]: 'success',
  [MARK_TYPES.FOUR]: 'processing',
  [MARK_TYPES.THREE]: 'warning',
  [MARK_TYPES.UNSATISFACTORILY]: 'error',
  [MARK_TYPES.PASSED]: 'success',
  [MARK_TYPES.NOT_PASSED]: 'error',
};


/**
 * Представление сданного студентом задания
 *
 * @param {import('./StudentWorkView').Props} props
 */
function StudentWorkView(props) {;
  const state = useState(State.create)[0];
  state.props = props;

  return (
    <>
      <Tag
        key={props.work.id}
        className="cursor-pointer"
        color={MARK_COLORS[props.work.mark] || 'default'}
        onClick={state.visible.setTrue}
      >
        {props.work.mark ? (
          <>
            <CheckCircleOutlined className="mr-1"/>
            {markTypeTranslator(props.work.mark)}
          </>
        ) : 'Ожидает оценки'}
      </Tag>
      <Modal
        title={`Проверка задания "${props.taskTitle}"`}
        visible={state.visible.value}
        footer={null}
        onCancel={state.visible.setFalse}
        onOk={state.visible.setFalse}
      >
        <h6>Комментарий студента</h6>
        {props.work.studentComment}
        <Divider/>
        <h6>Его файлы</h6>
        <FilesView fileIds={props.work.fileIds}/>
        <Divider/>
        <h6>Оценка</h6>
        <Spin spinning={state.loading.value}>
          <Form
            layout="vertical"
            onFinish={state.setMark}
          >
            <Form.Item
              label="Оценка:"
              name="mark"
              initialValue={props.work.mark}
            >
              <Select
                placeholder="Поставьте оценку"
                options={markTypeTranslatorOptionsExtended()}
              />
            </Form.Item>
            <Form.Item
              label="Комментарий:"
              name="teacherComment"
              rules={state.rules.teacherComment}
              initialValue={props.work.teacherComment}
            >
              <Input.TextArea placeholder="Комментарий"/>
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
            >
              {props.work.mark ? 'Переоценить' : 'Оценить'}
            </Button>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}
export default observer(StudentWorkView);

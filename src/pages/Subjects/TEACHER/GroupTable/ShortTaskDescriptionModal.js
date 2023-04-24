import React, { useState } from 'react';
import {
  Modal,
  Tooltip,
  Divider,
} from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';

import BaseState from 'plugins/mobx/BaseState';
import { BooleanState } from 'plugins/mobx/fields';
import FilesView from 'components/FilesView';


/** @extends {BaseState<undefined>} */
class State extends BaseState {
  visible = new BooleanState(false);

  static create() {
    return new State();
  }
}


/** @param {import('./ShortTaskDescriptionModal').Props} props */
function ShortTaskDescriptionModal(props) {
  const state = useState(State.create)[0];

  return (
    <>
      <Tooltip title="Текст задания">
        <BookOutlined onClick={state.visible.setTrue}/>
      </Tooltip>
      <Modal
        title={props.task.title}
        visible={state.visible.value}
        footer={null}
        onCancel={state.visible.setFalse}
        onOk={state.visible.setFalse}
      >
        <h5>Описание:</h5>
        {props.task.description || 'Нет описания'}
        <Divider/>
        <div>
          <h6>Дополнительные файлики</h6>
          <FilesView fileIds={props.task.fileIds}/>
        </div>
      </Modal>
    </>
  );
}
export default observer(ShortTaskDescriptionModal);

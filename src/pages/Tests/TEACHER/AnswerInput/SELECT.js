import React, { useState } from 'react';
import {
  Input,
  Checkbox,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';

import State from 'pages/Tests/TEACHER/AnswerInput/State';


/** @param {import('./index').Props} props */
function Choose(props) {
  const state = useState(State.create)[0];
  state.setProps(props);

  return (
    <div className="w-100">
      <Input
        className="w-75 mr-2"
        placeholder="Ответ"
        value={state.answer.text}
        onChange={state.setAnswerText}
      />
      <DeleteOutlined onClick={props.onDelete} />
      <Checkbox
        checked={state.answer.right}
        onChange={state.setAnswerRight}
      >
        Правильный
      </Checkbox>
    </div>
  );
}
export default observer(Choose);

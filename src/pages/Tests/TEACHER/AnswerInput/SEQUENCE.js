import React, { useState } from 'react';
import { Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';

import State from 'pages/Tests/TEACHER/AnswerInput/State';


/** @param {import('./index').Props} props */
function Sequense(props) {
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
    </div>
  );
}
export default observer(Sequense);

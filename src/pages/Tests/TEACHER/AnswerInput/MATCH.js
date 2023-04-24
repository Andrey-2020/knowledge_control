import React, { useState } from 'react';
import { Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';

import State from 'pages/Tests/TEACHER/AnswerInput/State';


const w45 = { width: '45%' };

/** @param {import('./index').Props} props */
function Match(props) {
  const state = useState(State.create)[0];
  state.setProps(props);

  return (
    <div className="w-100">
      <Input
        style={w45}
        placeholder="Ответ"
        value={state.answer.key}
        onChange={state.setAnswerKey}
      />
      <Input
        className="mr-2"
        style={w45}
        placeholder="Соответствие"
        value={state.answer.text}
        onChange={state.setAnswerText}
      />
      <DeleteOutlined onClick={props.onDelete} />
    </div>
  );
}
export default observer(Match);

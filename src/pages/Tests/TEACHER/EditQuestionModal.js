import React, { useState } from 'react';
import {
  
} from 'antd';
import {
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';

import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<import('./EditTest/EditQuestionModal').Props>} */
class State extends BaseState {
  constructor() {
    super();
    makeObservable(this, {

    });
  }

  static create() {
    return new State();
  }
}

function EditQuestion() {
  const state = useState(State.create)[0];

  return (

  );
}
export default observer(EditQuestion);

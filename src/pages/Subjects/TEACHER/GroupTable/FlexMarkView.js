import React, { useState } from 'react';
import {
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import { Checkbox } from 'antd';

import BaseState from 'plugins/mobx/BaseState';


const markLabels = [
  'visitMark',
  'taskMark',
  'testMark',
];
const markKeys = [
  'done',
  'total',
  'mark',
];
/**
 * @param {State} $this
 * @param {import('DBModels').FlexMark} data
 */
function setMarksData($this, data) {
  for (const label of markLabels) {
    for (const key of markKeys) {
      $this[label][key] = data[label][key];
    }
  }
}
const labelWidth = {
  display: 'inline-block',
  width: '135px',
};

/** @extends {BaseState<import('./FlexMarkView').Props>} */
class State extends BaseState {
  /** @type {import('./FlexMarkView').FinalMarkData} */
  visitMark = {
    done: 0,
    total: 1,
    mark: 0,
  };
  /** @type {import('./FlexMarkView').FinalMarkData} */
  taskMark = {
    done: 0,
    total: 1,
    mark: 0,
  };
  /** @type {import('./FlexMarkView').FinalMarkData} */
  testMark = {
    done: 0,
    total: 1,
    mark: 0,
  };

  allowVisitMark = true;
  allowTaskMark = true;
  allowTestMark = true;

  constructor() {
    super();
    makeObservable(this, {
      visitMark: observable.shallow,
      taskMark: observable.shallow,
      testMark: observable.shallow,
      allowVisitMark: observable,
      allowTaskMark: observable,
      allowTestMark: observable,
      visitMarkDonePercentText: computed,
      taskMarkDonePercentText: computed,
      testMarkDonePercentText: computed,
      finalMarkText: computed,
      setProps: action.bound,
      setAllowVisitMark: action.bound,
      setAllowTestMark: action.bound,
      setAllowTaskMark: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get visitMarkDonePercentText() {
    return `${((this.visitMark.done || 0) / (this.visitMark.total || 1)  * 100).toFixed(2)}%`;
  }
  get taskMarkDonePercentText() {
    return `${((this.taskMark.done || 0) / (this.taskMark.total || 1) * 100).toFixed(2)}%`;
  }
  get testMarkDonePercentText() {
    return `${((this.testMark.done || 0) / (this.testMark.total || 1) * 100).toFixed(2)}%`;
  }

  get finalMarkText() {
    let summa = 0;
    let count = 0;

    if (this.allowVisitMark) {
      summa += this.visitMark.mark;
      count++;
    }
    if (this.allowTaskMark) {
      summa += this.taskMark.mark;
      count++;
    }
    if (this.allowTestMark) {
      summa += this.testMark.mark;
      count++;
    }

    if (count === 0) {
      return null;
    }
    return (summa / count).toFixed(2);
  }

  /** @param {import('./FlexMarkView').Props} props */
  setProps(props) {
    this.props = props;
    setMarksData(this, props.target);
  }

  setAllowVisitMark(event) {
    this.allowVisitMark = event.target.checked;
  }
  setAllowTaskMark(event) {
    this.allowTaskMark = event.target.checked;
  }
  setAllowTestMark(event) {
    this.allowTestMark = event.target.checked;
  }
}

function FlexMarkView(props) {
  const state = useState(State.create)[0];
  state.setProps(props);

  return (
    <>
      <Checkbox
        checked={state.allowVisitMark}
        onChange={state.setAllowVisitMark}
      >
        <span className={state.allowVisitMark ? '' : 'text-line-through'}>
          <span
            className={state.allowVisitMark ? '' : 'text-line-through'}
            style={labelWidth}
          >
            Посещения:
          </span>
          {state.visitMarkDonePercentText}
          ({state.visitMark.mark})
        </span>
      </Checkbox>
      <br />
      <Checkbox
        checked={state.allowTaskMark}
        onChange={state.setAllowTaskMark}
      >
        <span className={state.allowTaskMark ? '' : 'text-line-through'}>
          <span
            className={state.allowTaskMark ? '' : 'text-line-through'}
            style={labelWidth}
          >
            Задания и работы:
          </span>
          {state.taskMarkDonePercentText}
          ({state.taskMark.mark})
        </span>
      </Checkbox>
      <br />
      <Checkbox
        checked={state.allowTestMark}
        onChange={state.setAllowTestMark}
      >
        <span className={state.allowTestMark ? '' : 'text-line-through'}>
          <span
            className={state.allowTestMark ? '' : 'text-line-through'}
            style={labelWidth}
          >
            Тесты:
          </span>
          {state.testMarkDonePercentText}
          ({state.testMark.mark})
        </span>
      </Checkbox>
      <br />
      Итого: {
        state.finalMarkText ?
        <b>{state.finalMarkText}</b> :
        'А как оценивать...'
      }
    </>
  );
}
export default observer(FlexMarkView);

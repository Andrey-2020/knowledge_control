import React, {
  useState,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeObservable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';

import store from 'globalStore';
import BaseState from 'plugins/mobx/BaseState';
import { emptyFunction } from 'utils/empties';
import classes from 'pages/Schedule/classes.module.scss';


/** @extends {BaseState<import('./SchedulePair').Props>} */
class State extends BaseState {
  constructor() {
    super();
    makeObservable(this, {
      subjects: computed,
      toSubject: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get subjects() {
    return store.UserData.subjects.value;
  }

  toSubject() {
    store.UserData.subjects.getForce()
    .then((subjects) => {
      const pairSubject = this.props.pair.subject.toLowerCase();
      const subject = subjects.find((subject) => subject.name.toLowerCase() === pairSubject);
      if (subject) {
        this.history.push(`/subjects/${subject.id}`);
      }
    })
    .catch(emptyFunction);
  }
}

/**
 * Цвет в зависимости от типа предмета в расписании
 */
const subjectTypesClassColors = {
  1: classes['pract'],
  2: classes['lect'],
  3: classes['lab'],
  undefined: classes['undefined'],
};

/**
 * Отображение одной пары в расписании
 * 
 * @param {import('./SchedulePair').Props} props
 */
function SchedulePair(props) {
  const history = useHistory();
  const { t } = useTranslation('pages.Schedule.SchedulePair', { useSuspense: false });

  const state = useState(State.create)[0];
  state.props = props;
  state.history = history;

  /** Типы предметов в расписании */
  const subjectTypesTranslation = useMemo(() => ({
    1: t('subjectTypes--1'),
    2: t('subjectTypes--2'),
    3: t('subjectTypes--3'),
  }), [t]);

  if (!props.pair) {
    return <td/>
  }
  return (
    <td>
      <div className={classes['schedule-props.pair']}>
        {/* цвет будет динамически задавать в зависимости от типа пары */}
        <div className={subjectTypesClassColors[props.pair.typeSubject]}/>
        <div>
          - {props.pair.subject}
        </div>
        <div>
          - {subjectTypesTranslation[props.pair.typeSubject] || t('subjectTypes--undefined')}
        </div>
        <div>
          - {props.pair.place}
        </div>
        {props.pair.teacher && (
          <div>
            - {props.pair.teacher}
          </div>
        )}
        {props.pair.nameGroup && (
          <div>
            - {props.pair.nameGroup}
          </div>
        )}
      </div>
    </td>
  );
}
export default observer(SchedulePair);

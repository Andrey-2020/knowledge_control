import React from 'react';
import {
  Row,
  Button,
} from 'antd';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

import eventStop from 'utils/eventStop';
import classes from 'pages/Subjects/Subjects.module.scss';
import TaskLinkIcon from 'components/icons/TaskLink';
import TestsLinkIcon from 'components/icons/TestsLink';
import LiteratureLinkIcon from 'components/icons/LiteratureLink';

/**
 * Карточка отдельного предмета на странице списка предметов
 *
 * @param {{ subject: import('DBModels').Subject }}
 */
export default function SubjectCard({ subject }) {
  const history = useHistory();

  return (
    <div
      className={classes.SubjectCard}
      onClick={() => { history.push(`/subjects/${subject.id}`); }}
    >
      <figure className={classes.SubjectImage}>
        <img
          alt="Предмет"
          src={`${process.env.PUBLIC_URL}/img/photo/Subject.png`}
        />
      </figure>

      <div>
        <h5>{subject.name}</h5>
        <div className="d-flex align-items-center">
          <span className={classes.TeacherName}>
            Горшков Д.А.
          </span>
        </div>
      </div>

      <p className={classes.SubjectDescription}>
        {subject.decryption}
      </p>

      <div className={classes.SubjectTypeBox}>
        <span className={classes.SubjectType}>
          Зачет
        </span>
      </div>

      <Row
        className="mt-2"
        justify="space-between"
      >
        <Button
          type="link"
          className={classNames('d-flex align-items-center', classes.SubjectLink)}
          onClick={eventStop(() => { history.push(`/subjects/${subject.id}/tasks`); })}
        >
          <TaskLinkIcon className={classes.TaskIcon}/>
          Задания
        </Button>
        <Button
          type="link"
          className={classNames('d-flex align-items-center', classes.SubjectLink)}
          onClick={eventStop(() => { history.push(`/subjects/${subject.id}/tests`); })}
        >
          <TestsLinkIcon className={classes.TestsIcon}/>
          Тесты
        </Button>
        <Button
          type="link"
          className={classNames('d-flex align-items-center', classes.SubjectLink)}
          onClick={eventStop(() => { history.push(`/subjects/${subject.id}/list-references`); })}
        >
          <LiteratureLinkIcon className={classes.LiteratureIcon}/>
          Литература
        </Button>
      </Row>
    </div>
  );
}
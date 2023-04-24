import React from 'react';
import SuspenseSwitch from 'plugins/router/SuspenseSwitch';
import {
  Link,
  useParams,
} from 'react-router-dom';

import classes from './Tests.module.scss';


/**
 * Разводная по тестам
 */
export default function Tests() {
  const { subjectId, themeId } = useParams();
  return (
    <SuspenseSwitch>
      <div>
        <h2>Описание работы:</h2>
        <p></p>
        <Link to={`/subjects/${subjectId}/tests/${themeId}`}>
          <button className={classes.TestCardLink}>
            Пройти тест заново
          </button>
        </Link>
      </div>

    </SuspenseSwitch>
  );
}

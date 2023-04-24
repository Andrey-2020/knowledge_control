import React, { useState } from 'react';
import {
  useParams,
  Link,
  useHistory,
} from 'react-router-dom';
import {
  Row,
  Col,
  Spin,
} from 'antd';
import { Helmet } from 'react-helmet';
import classnames from 'classnames';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import useOnce from 'utils/useOnce';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import http from 'plugins/http';
import store from 'globalStore';
import classes from './Tests.module.scss';
import Subtract from 'components/icons/Subtract';

/** Выбор теста из списка тестов */
export default function TestList() {
  const history = useHistory();
  const { subjectId } = useParams();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(subjectId))) {
    history.push('/subjects');
    return null;
  }
  const [componentUid] = useCancelableRequests('Tests/TestList');

  /**
   * @type {[
   *   import('DBModels').Theme[],
   *   React.Dispatch<React.SetStateAction<import('DBModels').Theme[]>>,
   * ]}
   */
  const [tests, setTests] = useState([]);
  /**
   * @type {[
   *   import('./TestList').PassedThemeShort,
   *   React.Dispatch<React.SetStateAction<import('./TestList').PassedThemeShort>>,
   * ]}
   */
  const [passed, setPassed] = useState({});
  const [loading, setLoading] = useState(true);
  useOnce(() => {
    http.get('/api/testing/themes', {
      params: { subj_id: subjectId },
      forCancel: { componentUid },
    })
    .then((response) => {
      console.log(response)
      setTests(response.data);
      return http.get('/testing/new/test/passed-themes', {
        params: {
          subj_id: subjectId,
          user_id: store.userId,
        },
        forCancel: { componentUid },
      });
    })
    .then((response) => {
      console.log(response)
      const passed = {};
      for (const testResult of response.data) {
        passed[testResult.theme.id] = testResult.ratings;
      }
      setPassed(passed);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить списочек тестиков по предметику', error), 5);
    }))
    .finally(() => {
      setLoading(false);
    });
  });

  return (
    <>
      <Helmet>
        <title>Список тестов</title>
      </Helmet>
      <Row>
        <Link
          className={classes.BackLink}
          to="/subjects"
        >
					<Row className="align-items-center">
						<Subtract className="mr-3"/>
						Назад к списку предметов
					</Row>
        </Link>
      </Row>
      <Spin
        size="large"
        tip="Списочек тестиков загружается..."
        spinning={loading}
      >
				<Row
          className="mt-3"
          gutter={[40, 40]}
        >
      {(tests.length===0&&!loading)?(<p>Тестов по данному предмету нет</p>):''}
					{tests.map(({ id, name }) => (
            <Col
              key={id}
              className="gutter-row"
              sm={24}
              md={12}
              lg={8}
            >
              <Link
                className={classes.TestCardLink}
                to={`/subjects/${subjectId}/tests/${id}/about`}
              >
                <div className={classnames('p-3', classes.TestCard)}>
                  <div className="d-flex">
                    <img
                      className={classes.Icon}
                      alt="Логотип теста"
                      src={`${process.env.PUBLIC_URL}/img/photo/SubjectSmall.png`}
                    />
                    <div className={classes.CardContent}>
                      {name}
                      <div className={classes.Counter}>
                        <span
                          className={classnames(
                            classes.PassedCount,
                            passed[id] ? classes.BlueContainer : classes.RedContainer,
                          )}
                        >
                          {passed[id] === undefined ? 'Нет попыток' : String(passed[id])}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </Col>
					))}
				</Row>
			</Spin>
    </>
  );
}

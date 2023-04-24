import React, { useState } from 'react';
import {
  message,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  useHistory,
  useParams,
  Link,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import useOnce from 'utils/useOnce';
import eventStop from 'utils/eventStop';
import http from 'plugins/http';
import Subtract from 'components/icons/Subtract';
import classes from 'pages/Tests/Tests.module.scss';

/**
 * Список тестов
 */
export default function GroupsTests() {
  const history = useHistory();
  const { subjectId } = useParams();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(subjectId))) {
    history.push('/subjects');
    return null;
  }
  const [componentUid] = useCancelableRequests('Tests/GroupsTests');

  /**
   * @type {[
   *   import('DBModels').Theme[],
   *   React.Dispatch<React.SetStateAction<import('DBModels').Theme[]>>,
   * ]}
   */
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  useOnce(() => {
    http.get('/api/testing/themes', {
      params: { subj_id: subjectId },
      forCancel: { componentUid }
    })
    .then((response) => {
      setThemes(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError('Не удалось получить список групп', error), 5);
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
          {themes.map(({ id, name }) => (
            <Col
              key={id}
              className="gutter-row"
              sm={24}
              md={12}
              lg={8}
              onClick={() => { history.push(`/subjects/${subjectId}/tests/${id}/edit`) }}
            >
              <div className={classNames('p-3', classes.TestCard)}>
                <div className="d-flex">
                  <img
                    className={classes.Icon}
                    alt="Логотип теста"
                    src={`${process.env.PUBLIC_URL}/img/photo/SubjectSmall.png`}
                  />
                  <div className={classes.CardContent}>
                    {name}
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        <Row
          className="mt-4"
          gutter={[40, 40]}
        >
          <Col
            className="gutter-row"
            sm={24}
            md={12}
            lg={8}
            onClick={eventStop(() => {
              history.push(`/subjects/${subjectId}/tests/add`);
            })}
          >
            <div className={classNames('p-3', classes.TestCard)}>
              <div className="d-flex">
                <div className={classes.Icon}>
                  <img
                    width="50px"
                    height="50px"
                    alt="Картинка добавление текста с плюсиком"
                    src={`${process.env.PUBLIC_URL}/img/photo/Plus.png`}
                  />
                </div>
                <div className={classes.CardContent}>
                  Добавить тест
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Spin>
    </>
  );
}

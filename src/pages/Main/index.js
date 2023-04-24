import React, {
  useState,
  useEffect,
} from 'react';
import { Helmet } from 'react-helmet';
import {
  Row,
  Col,
  Card,
  Progress,
  Table,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  makeObservable,
  computed,
  action,
  autorun,
} from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';

import 'utils/loading-bar/loading-bar';
import 'utils/loading-bar/loading-bar.css';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import progressFormat from 'utils/progressFormat';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import useOnce from 'utils/useOnce';
import http from 'plugins/http';
import store from 'globalStore';
import { ROLES } from 'globalStore/constants';
import { SettedState } from 'plugins/mobx/fields';
import { emptyArray } from 'utils/empties';
import 'pages/Main/index.css';
import BaseState from 'plugins/mobx/BaseState';


const MAIN_PAGE_LOGO_IMG_SRC = `${process.env.PUBLIC_URL}/img/photo/AverageMark.png`;
const OVERDUE_WORKS_IMG_SRC = `${process.env.PUBLIC_URL}/img/diagram.png`;
const COMPLETED_TESTS_IMG_SRC = `${process.env.PUBLIC_URL}/img/win.png`;
const COMPLETED_WORKS_IMG_SRC = `${process.env.PUBLIC_URL}/img/book.png`;

/**
 * Данные статистики, пока моканы и вне компонента
 */
const data = [
  {
    key: '1',
    name: 'Анна Вячеславовна Лылова',
    date: '26 Окт 2019',
    time: 14.56,
    message: 'Работа №2 принята',
  },
  {
    key: '2',
    name: 'Анна Вячеславовна Лылова',
    date: '26 Окт 2019',
    time: 14.56,
    message: 'Работа №2 принята',
  },
  {
    key: '3',
    name: 'Анна Вячеславовна Лылова',
    date: '26 Окт 2019',
    time: 14.56,
    message: 'Работа №2 принята',
  },
];

/** @extends {BaseState<undefined>} */
class State extends BaseState {
  statistics = new SettedState({
    tests: {
      done: 0,
      total: 1,
    },
    labs: {
      done: 0,
      total: 1,
    },
    practices: {
      done: 0,
      total: 1,
    },
    essays: {
      done: 0,
      total: 1,
    },
  }, true);
  statisticGraphComponent = null;

  constructor() {
    super();
    makeObservable(this, {
      columns: computed,
      statisticGraphPercent: computed,
      getStatistics: action.bound,
      initStatisticGraphComponent: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get columns() {
    return [
      {
        dataIndex: 'name',
      },
      {
        dataIndex: 'date',
      },
      {
        dataIndex: 'time',
      },
      {
        dataIndex: 'message',
      },
    ];
  }

  get statisticGraphPercent() {
    const totalStat = (
      this.statistics.value.tests.total +
      this.statistics.value.labs.total +
      this.statistics.value.practices.total +
      this.statistics.value.essays.total
    ) || 1;

    const doneStat =
      this.statistics.value.tests.done +
      this.statistics.value.labs.done +
      this.statistics.value.practices.done +
      this.statistics.value.essays.done;

    return (doneStat / totalStat) * 100;
  }

  getStatistics() {
    if (store.userRole !== ROLES.USER) {
      return;
    }
    http.get('api/performance/', { forCancel: { componentUid: this.cancelableRequests.componentUid } })
    .then((response) => {
      this.statistics.set(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        i18n.t('pages.Main.index:useOnce.get-performance.error'), error), 5);
    }));
  }

  initStatisticGraphComponent() {
    let autorunDisposer = () => {};
    try {
      this.statisticGraphComponent = new window.ldBar('#statistic-graph');
      this.statisticGraphComponent.set(0);
      autorunDisposer = autorun(() => {
        this.statisticGraphComponent.set(this.statisticGraphPercent);
      });
    } catch (error) {
      console.warn('Error while initialize manBar:', error);
    }
    return () => {
      autorunDisposer();
      this.statisticGraphComponent = null;
    };
  }
}

/**
 * Комполнент главной страницы
 */
function Index() {
  const { t } = useTranslation('pages.Main.index', { useSuspense: false });

  const state = useState(State.create)[0];
  state.cancelableRequests.componentUid = useCancelableRequests('Main/Index')[0];
  useOnce(state.getStatistics);

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(state.initStatisticGraphComponent, emptyArray);

  return (
    <>
      <Helmet>
        <title>{t('template.title')}</title>
      </Helmet>
      <div>
        <Row gutter={30}>
          <Col
            xs={24}
            xl={16}
          >
            <Row gutter={30}>
              <Col span={24}>
                <img
                  className="img-fluid"
                  alt={t('template.img-alt--logo')}
                  src={MAIN_PAGE_LOGO_IMG_SRC}
                />
              </Col>
            </Row>
            <Row gutter={30}>
              <Col
                xs={24}
                md={8}
              >
                <Card className="card-stat" >
                  <img
                    alt={t('template.img-logo--overdue-works')}
                    src={OVERDUE_WORKS_IMG_SRC}
                  />
                  <div className="card-stat-text">
                    9
                    <br/>
                    <small>
                      {t('template.overdue-works', { count: 9 })}
                    </small>
                  </div>
                </Card>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Card className="card-stat" >
                  <img
                    alt={t('template.img-logo--completed-tests')}
                    src={COMPLETED_TESTS_IMG_SRC}
                  />
                  <div className="card-stat-text">
                    {state.statistics.value.tests.done}
                    <br/>
                    <small>
                      {t('template.completed-tests', { count: state.statistics.value.tests.done })}
                    </small>
                  </div>
                </Card>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Card className="card-stat" >
                  <img
                    alt={t('template.img-logo--completed-works')}
                    src={COMPLETED_WORKS_IMG_SRC}
                  />
                  <div className="card-stat-text">
                    {state.statistics.value.labs.done}
                    <br/>
                    <small>
                      {t('template.completed-works', { count: state.statistics.value.labs.done })}
                    </small>
                  </div>
                </Card>
              </Col>
            </Row>
            <Row gutter={30}>
              <Col
                xs={24}
                md={16}
              >
                <Card
                  className="bottom-card text-dark-3-text"
                  headStyle={{
                    fontWeight: "500",
                    fontSize: "20px",
                  }}
                  bordered
                  title={t('template.answers-for-completed-works')}
                >
                  <Table
                    size="small"
                    pagination={false}
                    showHeader={false}
                    columns={state.columns}
                    dataSource={data}
                  />
                </Card>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Card
                  className="bottom-card text-dark-3-text"
                  headStyle={{
                    fontWeight: '500',
                    fontSize: '20px',
                  }}
                  bodyStyle={{ textAlign: 'center' }}
                  bordered
                  title={t('template.attendance')}
                >
                  <Progress
                    className="mr-3"
                    strokeColor="var(--red-base)"
                    type="circle"
                    percent={75}
                    format={progressFormat}
                  />
                  <Progress
                    strokeColor="var(--blue-base)"
                    type="circle"
                    percent={100}
                    format={progressFormat}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
          <Col
            xs={24}
            xl={8}
          >
            <Card
              key="statistic-graph"
              style={{
                width: '100%',
                height: 'calc(100vh - 82px - 48px)',
                textAlign: 'center',
                borderRadius: '12px',
              }}
            >
              <div
                id="statistic-graph"
                style={{
                  height: "calc(100vh - 82px - 48px - 48px)",
                  maxWidth: "100%",
                }}
                data-type="fill"
                // Не вынесено в константу, потому что в перспективе можно сделать замену картинки
                data-img={`${process.env.PUBLIC_URL}/img/photo/student_owl.svg`}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
export default observer(Index);

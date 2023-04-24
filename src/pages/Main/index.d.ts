import { ColumnsType } from 'antd/lib/table';

import { SettedState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Statistic {
  done: number,
  total: number,
}

export interface Statistics {
  tests: Statistic,
  labs: Statistic,
  practices: Statistic,
  essays: Statistic,
}

export declare const statisticsInitState: Statistics = {
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
};

export class State extends BaseState<undefined> {
  statistics: SettedState;
  statisticGraphComponent: { set: (percent: number) => void };

  static create(): State;

  get columns(): TableColumnType;

  get statisticGraphPercent(): number;

  getStatistics(): void;

  initStatisticGraphComponent(): () => void;
}

/**
 * Комполнент главной страницы
 */
export default function Main(): JSX.Element;

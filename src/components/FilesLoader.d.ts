import { RcFile } from 'antd/lib/upload';
import { AxiosRequestConfig } from 'axios';

import { UserFile } from 'DBModels';
import BaseState from 'plugins/mobx/BaseState';


export interface onChangeArgs {
  unloaded: number,
  loaded: number[],
}

/**
 * Изначальное состояние, можно использовать для инициализации
 */
export function onChangeArgsDefault(): onChangeArgs;

export interface Props {
  onChange: (onChangeArgs: onChangeArgs) => void,
  componentReset: (reset: () => void) => void,
}

export class State extends BaseState<Props> {
  fileList: [];
  loadedFiles: {
    [fileUid: string]: UserFile,
  };
  unloadedFiles: Set<number>;
  static create(): State;
  get FileLoaderComponentList(): JSX.Element[];
  emitOnChange(): void;
  // Функция для reset'а состояния компонента
  reset(): void;
  addFile(file: RcFile): false;
  removeFile(file: RcFile): void;
  setFileLoadedState(
    file: RcFile,
    id: number,
  ): void;
}

/**
 * Загрузчик файлов, контролирует список файлов
 */
export default function FilesLoader(args: Props): JSX.Element;

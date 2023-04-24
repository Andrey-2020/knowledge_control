import { UserFile } from 'DBModels';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  fileIds: number[],
}

export class State extends BaseState<Props> {
  loading: {
    value: boolean;
    set(value: boolean): void;
  };
  files: UserFile[];
  static create(): State;
  get FileViewComponents(): JSX.Element[];
  searchFiles(): void;
}

/**
 * Представление файлов с возможностью их скачать.
 * Показываются в строчку.
 */
export default function FilesView(args: {
  files: number[],
}): JSX.Element;

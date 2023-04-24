import { ReactNode } from 'react';

import { UserFile } from 'DBModels';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  file: UserFile,
}

export class State extends BaseState<Props>{
  propsFile: UserFile;
  loading: {
    value: boolean;
    set(value: boolean): void;
  };
  loadedFileUrl: {
    value: null | string;
    set(value: string): void;
  };
  static create(): State;
  get tooltipTitle(): ReactNode;
  get isImage(): boolean;
  /** Для использование в useEffect */
  downloadSmallImageAndRevokeUrl(): () => void;
  downloadFile(): void;
  onClickLink(): void;
}

/**
 * Представление одного файла.
 * Картинки загружаются и показываются сразу.
 */
export default function FileView(args: Props): JSX.Element;

/**
 * Функция загрузки файла с сервера.
 * Возвращаяется URL созданный из @see UserFile
 * 
 * @async
 */
 export async function downloadFileInURL(
  fileId: number,
  fileName: string,
  componentUid: string,
): Promise<string>;

/**
 * Стандартный костыль с созданием ссылки и кликом на неё
 */
export function loadFileFromURL(
  url: string,
  filename: string,
): void;

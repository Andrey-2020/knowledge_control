import { RcFile } from 'antd/lib/upload';
import { AxiosRequestConfig } from 'axios';

import { UserFile } from 'DBModels';
import { CancelableRequestsObject } from 'plugins/http/useCancelableRequests';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  file: RcFile,
  onRemove: (file: RcFile) => void,
  onLoad: (file: RcFile) => void,
}

export class State extends BaseState<Props> {
  progress: {
    value: number;
    set(value: number): void;
  };
  static create(): State;
  uploadFile(): void;
  cancelUploadFile(): void;
}

/**
 * Загрузчик отдельного файла
 */
export default function FileLoader(args: Props): JSX.Element;


/**
 * Загрузка файла на сервер
 * 
 * @async
 */
export async function uploadFile(
  file: File,
  componentUid: string,
  requestOptions?: AxiosRequestConfig,
): Promise<UserFile>;

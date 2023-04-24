import React, { useState } from 'react';
import {
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import {
  Button,
  Tooltip,
  message,
} from 'antd';

import http from 'plugins/http';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';
import useOnceWithRevoke from 'utils/useOnceWithRevoke';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';


/** @extends {BaseState<import('./FileView').Props>} */
class State extends BaseState {
  /** @type {import('DBModels').UserFile} */
  propsFile = {
    id: 0,
    name: '',
    contentType: '',
    contentLength: 0,
    userId: 0,
    accessLevel: '',
    linkCount: 0,
  };
  loading = new BooleanState(false);
  loadedFileUrl = new SettedState(null);

  constructor() {
    super();
    makeObservable(this, {
      propsFile: observable.ref,
      setProps: action,
      isImage: computed,
      tooltipTitle: computed,
      downloadSmallImageAndRevokeUrl: action.bound,
      downloadFile: action.bound,
      onClickLink: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /** @param {import('./FileView').Props} props */
  setProps(props) {
    this.props = props;

    if (props.file.id !== this.propsFile.id) {
      this.propsFile = props.file;
    }
  }

  get isImage() {
    return this.propsFile.contentType.startsWith('image/');
  }

  get tooltipTitle() {
    // При загрузке надпись
    if (this.loading.value) {
      return 'Файл загружается...';
    }

    if (this.loadedFileUrl.value) {
      // Если есть файл и это картинка
      if (this.isImage) {
        return (
          <>
            Нажмите, чтобы скачать картинку
            <img
              width="200px"
              alt={this.propsFile.name}
              src={this.loadedFileUrl.value}
            />
          </>
        );
      }
      // Если файл не картинка
      return 'Нажмите, чтобы скачать файл повторно';
    }

    // Если файла нет и это картинка
    if (this.isImage) {
      return 'Нажмите, чтобы загрузить картинку';
    }
    // Если файла нет и он не картинка
    return 'Нажмите, чтобы загрузить файл';
  }

  /** Для использование в useEffect */
  downloadSmallImageAndRevokeUrl() {
    // Маленькие картики (меньше 1МБ) загружаются сразу
    if (this.isImage && this.propsFile.contentLength <= 1024 * 1024 * 1024) {
      this.downloadFile();
    }
    return () => {
      URL.revokeObjectURL(this.loadedFileUrl.value);
    }
  }

  downloadFile() {
    this.loading.value = true;
    downloadFileInURL(this.propsFile.id, this.propsFile.name, this.cancelableRequests.componentUid)
    .then((url) => {
      this.loadedFileUrl.set(url);
      // Если не картинка, то скачивать сразу
      if (!this.isImage) {
        loadFileFromURL(this.loadedFileUrl.value, this.propsFile.name);
      }
    })
    .finally(this.loading.setFalse);
  }

  onClickLink() {
    // Если загрузка, то скип
    if (this.loading.value) {
      return;
    }
    // Если нет файла, то загрузить, а если есть, то скачать
    if (!this.loadedFileUrl.value) {
      this.downloadFile();
    } else {
      loadFileFromURL(this.loadedFileUrl.value, this.propsFile.name);
    }
  }
}

/**
 * Представление одного файла.
 * Картинки загружаются и показываются сразу.
 *
 * @param {import('./FileView').Props} props
 */
function FileView(props) {
  const [componentUid] = useCancelableRequests(`FilesView/FilePreview(${props.file.id})`);

  const state = useState(State.create)[0];
  state.setProps(props);
  state.cancelableRequests.componentUid = componentUid;
  useOnceWithRevoke(state.downloadSmallImageAndRevokeUrl);

  return (
    <Tooltip title={state.tooltipTitle}>
      <Button
        type="link"
        onClick={state.onClickLink}
      >
        <img
          className="mr-1 h-100"
          alt="Файл"
          src={`${process.env.PUBLIC_URL}/img/photo/Files.png`}
        />
        {props.file.name}
      </Button>
    </Tooltip>
  );
}
export default observer(FileView);

/**
 * Функция загрузки файла с сервера.
 * Возвращаяется URL созданный из @see import('DBModels').UserFile
 *
 * @async
 * @param {number} fileId
 * @param {string} fileName
 * @param {string} componentUid
 *
 * @returns {Promise<string>}
 */
export async function downloadFileInURL(fileId, fileName, componentUid) {
  // Warning возникает при вызове любого message
  const loading = message.loading(`Файл "${fileName}" скачивается, подождите...`);

  try {
    const response = await http.get('/files', {
      timeout: 0,
      params: { id: fileId },
      responseType: 'blob',
      forCancel: {
        componentUid,
        requestUid: fileId,
      },
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        `Не удалось скачать файл(${fileName})`, error), 5);
    }).call(null, error);
  } finally {
    loading();
  }
}

/**
 * Стандартный костыль с созданием ссылки и кликом на неё, чтобы скачать файл
 *
 * @param {string} url
 * @param {string} filename
 */
export function loadFileFromURL(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}

import React from 'react';
import clipboardCopy from 'clipboard-copy';
import {
  Button,
  Tooltip,
  message,
} from 'antd';

/**
 * Предохранитель на случай ошибки в любой части приложения
 * (так как других предохранителей нет)
 */
export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };

    this.copyError = this.copyError.bind(this);
    this.copyEmail = this.copyEmail.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  copyError() {
    clipboardCopy(this.state.error.stack)
    .then(() => {
      message.success('Скопировано');
    });
  }

  copyEmail() {
    clipboardCopy('damir_saitov1985@mail.ru')
    .then(() => {
      message.success('Скопировано');
    });
  }

  render() {
    if (this.state.error) {
      // Можно отрендерить запасной UI произвольного вида
      return (
        <h2 className="error-boundary">
          Упс! Что-то пошло не так и мы очень об этом сожалеем.
          А сейчас вы должны помочь нам исправить ошибку.
          Для этого перешлите
          <Tooltip title="Скопировать">
            <Button
              className="px-2 py-0"
              type="link"
              onClick={this.copyError}
            >
              ошибку
            </Button>
          </Tooltip>
          <small>(при нажатии на слово "ошибку" она скопируется)</small>
          на этот адрес электронной почты:
          <Tooltip title="Скопировать">
            <Button
              className="px-2 py-0"
              type="link"
              onClick={this.copyEmail}
            >
              damir_saitov1985@mail.ru
            </Button>
          </Tooltip>
          <small>(при нажатии на адрес он тоже скопируется)</small>
          . Также мы будем очень благодарны,
          если вы опишите свои действия,
          которые привели к возникновению ошибки.
          <b>
            Спасибо!
          </b>
        </h2>
      );
    }

    return this.props.children; 
  }
}
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { browserName } from 'react-device-detect';

import App from 'App';
import 'index.css';
import reportWebVitals from 'reportWebVitals';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Проверка браузера на наличие Proxy, потому что на нём работает хранилище
if (window.Proxy === undefined) {
  // Функции рендера для отвельных браузеров
  const browserMessages = {
    'Chrome'() {
      return (
        <div className="no-support-card">
          Нужно обновить браузер.
          <br/>
          <a href="https://www.google.com/intl/ru_ru/chrome/">
            Возьму и обновлю
          </a>
        </div>
      );
    },
    'Yandex'() {
      return (
        <div className="no-support-card">
          Ваш версия браузера не поддерживает некоторые программистические штучки,
          его нужно обновить.
          <br/>
          <a href="https://browser.yandex.ru/">
            Добавить штучки
          </a>
        </div>
      );
    },
    'Opera'(){
      return (
        <div className="no-support-card">
          Произошли непредвиденные обстоятельства с
          оборудованием вашего браузера и его нужно обновить.
          <br/>
          <a href="https://www.opera.com/ru">
            Обновить
          </a>
        </div>
      );
    },
    'Firefox'() {
      return (
        <div className="no-support-card">
          Браузер стар, ему нужны новые импланты.
          <br/>
          <a href="https://www.mozilla.org/ru/firefox/new/">
            Установить
          </a>
        </div>
      );
    },
    'IE'() {
      return (
        <div className="no-support-card">
          Наше приложение не работает на этом браузере, и вам не советует.
          <br/>
          <a href="https://www.google.com/intl/ru_ru/chrome/">
            Работать на этом браузере
          </a>
        </div>
      );
    },
  };
  /**
   * Выбор сообщения, если браузер есть в списке
   * 
   * @type {JSX.Element}
   */
  const UpdateBrowser = (browserName in browserMessages) ?
    browserMessages[browserName]() : (
      <div className="no-support-card">
        Я не знаю, что у вас за браузер, но его надо обновить.
        <br/>
        <a href="https://www.google.com/intl/ru_ru/chrome/">
          Обновить на Chrome
        </a>
      </div>
    );
  

  ReactDOM.render((UpdateBrowser), document.getElementById('root'));
} else {
  ReactDOM.render(
    // <React.StrictMode>
      <BrowserRouter>

        <App/>

      </BrowserRouter>,
    // </React.StrictMode>,
    document.getElementById('root')
  );
}


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

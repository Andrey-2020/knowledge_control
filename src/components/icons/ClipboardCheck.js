import React from 'react';
import Icon from '@ant-design/icons';

export default function ClipboardCheckIcon(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="22" height="22" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd" clipRule="evenodd" d="M8.4 19.2L3.6 14.614L5.292 12.9975L8.4 15.9554L16.308 8.4L18 10.028L8.4 19.2ZM10.8 2.4C11.46 2.4 12 2.94 12 3.6C12 4.26 11.46 4.8 10.8 4.8C10.14 4.8 9.6 4.26 9.6 3.6C9.6 2.94 10.14 2.4 10.8 2.4ZM19.2 2.4H14.184C13.68 1.008 12.36 0 10.8 0C9.24 0 7.92 1.008 7.416 2.4H2.4C1.08 2.4 0 3.48 0 4.8V21.6C0 22.92 1.08 24 2.4 24H19.2C20.52 24 21.6 22.92 21.6 21.6V4.8C21.6 3.48 20.52 2.4 19.2 2.4Z"
            fill="white"
          />
        </svg>
      )}
    />
  )
}

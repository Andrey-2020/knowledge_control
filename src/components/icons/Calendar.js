import React from 'react';
import Icon from '@ant-design/icons';

export default function CalendarIcon(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="22" height="22" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd" clipRule="evenodd" d="M2.4 21.6H19.2V8.4H2.4V21.6ZM19.2 2.4H18V0H15.6V2.4H6V0H3.6V2.4H2.4C1.068 2.4 0.012 3.48 0.012 4.8L0 21.6C0 22.92 1.068 24 2.4 24H19.2C20.52 24 21.6 22.92 21.6 21.6V4.8C21.6 3.48 20.52 2.4 19.2 2.4ZM14.4 13.2H16.8V10.8H14.4V13.2ZM9.6 13.2H12V10.8H9.6V13.2ZM4.8 13.2H7.2V10.8H4.8V13.2Z"
            fill="white"
          />
        </svg>
      )}
    />
  )
}

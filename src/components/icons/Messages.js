import React from 'react';
import Icon from '@ant-design/icons';

export default function MessagesIcon(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd" clipRule="evenodd" d="M18 12V1.2C18 0.54 17.46 0 16.8 0H1.2C0.54 0 0 0.54 0 1.2V18L4.8 13.2H16.8C17.46 13.2 18 12.66 18 12ZM22.7999 4.80003H20.3999V15.6H4.79987V18C4.79987 18.66 5.33987 19.2 5.99987 19.2H19.1999L23.9999 24V6.00003C23.9999 5.34003 23.4599 4.80003 22.7999 4.80003Z"
            fill="white"
          />
        </svg>
      )}
    />
  )
}

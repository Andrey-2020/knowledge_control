import React from 'react';
import Icon from '@ant-design/icons';

export default function TimeIcon(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M6.993 0C3.129 0 0 3.136 0 7C0 10.864 3.129 14 6.993 14C10.864 14 14 10.864 14 7C14 3.136 10.864 0 6.993 0ZM6.9998 12.5998C3.9058 12.5998 1.3998 10.0938 1.3998 6.9998C1.3998 3.9058 3.9058 1.3998 6.9998 1.3998C10.0938 1.3998 12.5998 3.9058 12.5998 6.9998C12.5998 10.0938 10.0938 12.5998 6.9998 12.5998ZM7.3501 3.5H6.3001V7.7L9.9751 9.905L10.5001 9.044L7.3501 7.175V3.5Z" fill="#A8C6DF"/>
        </svg>
      )}
    />
  )
}

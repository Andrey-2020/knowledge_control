import React from 'react';
import Icon from '@ant-design/icons';

export default function TaskLink(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12.4444 -0.00012207H1.55556C0.7 -0.00012207 0 0.699878 0 1.55543V12.4443C0 13.2999 0.7 13.9999 1.55556 13.9999H12.4444C13.3 13.9999 14 13.2999 14 12.4443V1.55543C14 0.699878 13.3 -0.00012207 12.4444 -0.00012207ZM5.66667 9.99988L3 7.45211L3.94 6.55402L5.66667 8.19733L10.06 3.99988L11 4.90434L5.66667 9.99988Z"/>
        </svg>
      )}
    />
  )
}

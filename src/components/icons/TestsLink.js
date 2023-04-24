import React from 'react';
import Icon from '@ant-design/icons';

export default function TestsLink(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M9.57617 10.9999H11.0008V7.49988H9.57617V10.9999ZM6.19727 10.9999H7.62192V3.99988H6.19727V10.9999ZM3 10.9999H4.42466V5.16654H3V10.9999ZM12.4444 -0.00012207H1.55556C0.7 -0.00012207 0 0.699878 0 1.55543V12.4443C0 13.2999 0.7 13.9999 1.55556 13.9999H12.4444C13.3 13.9999 14 13.2999 14 12.4443V1.55543C14 0.699878 13.3 -0.00012207 12.4444 -0.00012207Z"/>
        </svg>
      )}
    />
  )
}

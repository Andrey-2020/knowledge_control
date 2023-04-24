import React from 'react';
import Icon from '@ant-design/icons';

export default function ChartBoxIcon(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd" clipRule="evenodd" d="M11.7 13.5H13.5V9.89999H11.7V13.5ZM8.09999 13.5H9.89998V3.60001H8.09999V13.5ZM3.60003 14.4H5.40003V7.19999H3.60003V14.4ZM16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0Z"
            fill="white"
          />
        </svg>
      )}
    />
  )
}

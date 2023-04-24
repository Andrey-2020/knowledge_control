import React from 'react';
import Icon from '@ant-design/icons';

export default function InfoFailedIcon(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M7 0C3.136 0 0 3.136 0 7C0 10.864 3.136 14 7 14C10.864 14 14 10.864 14 7C14 3.136 10.864 0 7 0ZM7.7001 10.5001H6.3001V6.3001H7.7001V10.5001ZM7.7001 4.9H6.3001V3.5H7.7001V4.9Z" fill="#FD6374"/>
        </svg>
      )}
    />
  )
}

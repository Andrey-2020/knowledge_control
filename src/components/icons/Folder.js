import React from 'react';
import Icon from '@ant-design/icons';

export default function FolderIcon(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="33" height="27" viewBox="0 0 33 27" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M29.7 3.375H16.5L13.2 0H3.3C1.485 0 0.0165 1.51875 0.0165 3.375L0 23.625C0 25.4813 1.485 27 3.3 27H29.7C31.515 27 33 25.4813 33 23.625V6.75C33 4.89375 31.515 3.375 29.7 3.375ZM21.4508 8.4375C23.2658 8.4375 24.7508 9.95625 24.7508 11.8125C24.7508 13.6687 23.2658 15.1875 21.4508 15.1875C19.6358 15.1875 18.1508 13.6687 18.1508 11.8125C18.1508 9.95625 19.6358 8.4375 21.4508 8.4375ZM28.0492 21.9375H14.8492V20.25C14.8492 18.0056 19.2547 16.875 21.4492 16.875C23.6437 16.875 28.0492 18.0056 28.0492 20.25V21.9375Z" fill="#7E95A7"/>
        </svg>
      )}
    />
  )
}
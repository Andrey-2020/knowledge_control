import React from 'react';
import Icon from '@ant-design/icons';

export default function Literature(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="48" height="50" viewBox="0 0 48 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.99707" y="0.0281982" width="42.8544" height="42.3944" rx="12" fill="#FAAA1E" fillOpacity="0.2"/>
          <path d="M13 13H18.9167C19.9628 13 20.9661 13.4156 21.7058 14.1553C22.4455 14.895 22.8611 15.8983 22.8611 16.9444V30.75C22.8611 29.9654 22.5494 29.2129 21.9946 28.6581C21.4398 28.1033 20.6874 27.7917 19.9028 27.7917H13V13Z" fill="#FAAA1E"/>
          <path d="M32.7224 13H26.8058C25.7596 13 24.7564 13.4156 24.0166 14.1553C23.2769 14.895 22.8613 15.8983 22.8613 16.9444V30.75C22.8613 29.9654 23.173 29.2129 23.7278 28.6581C24.2826 28.1033 25.0351 27.7917 25.8197 27.7917H32.7224V13Z" fill="#FAAA1E"/>
        </svg>
      )}
    />
  )
}

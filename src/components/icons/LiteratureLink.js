import React from 'react';
import Icon from '@ant-design/icons';

export default function LiteratureLink(props) {
  return (
    <Icon
      {...props}
      component={() => (
        <svg width="14" height="12" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0H4.19994C4.94254 0 5.65472 0.280951 6.17981 0.781046C6.70491 1.28114 6.9999 1.95942 6.9999 2.66666V12C6.9999 11.4695 6.77866 10.9608 6.38484 10.5858C5.99101 10.2107 5.45688 9.99997 4.89993 9.99997H0V0Z"/>
          <path d="M13.9999 -0.00012207H9.79996C9.05737 -0.00012207 8.34518 0.280828 7.82009 0.780924C7.295 1.28102 7 1.95929 7 2.66654V11.9998C7 11.4694 7.22125 10.9607 7.61507 10.5856C8.00889 10.2106 8.54302 9.99984 9.09997 9.99984H13.9999V-0.00012207Z"/>
        </svg>
      )}
    />
  )
}
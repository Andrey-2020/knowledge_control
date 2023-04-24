import React, { Suspense } from 'react';
import { Switch } from 'react-router-dom';
import { Spin } from 'antd';

/**
 * Switch обёрнутый в Suspense с fallback со Spin'ом
 * 
 * @param {{ children: (JSX.Element | JSX.Element[]) }}
 */
export default function SuspenseSwitch({ children }) {
  return (
    <Suspense
      fallback={
        <div className="py-2 text-center">
          <Spin
            spinning
            size="large"
            tip="Загрузка..."
          />
        </div>
      }
    >
      <Switch>
        {children}
      </Switch>
    </Suspense>
  );
}

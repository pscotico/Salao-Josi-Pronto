import React from 'react';
import { createRoot } from 'react-dom/client';
import Routes from './routes';
import { Provider } from 'react-redux';
import store from './store';
import { AuthProvider } from './contexts/AuthContext';

const root = createRoot(document.getElementById('root'));

root.render(
  <div translate="no">
    <Provider store={store}>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </Provider>
  </div>
);


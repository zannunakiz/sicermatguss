import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PairedDeviceProvider } from './context/PairedDeviceContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <PairedDeviceProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </PairedDeviceProvider>
  </BrowserRouter>
);

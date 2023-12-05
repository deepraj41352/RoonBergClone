import React from 'react';
// import { createRoot } from 'react-dom';
// import ReactDOM from 'react-dom/client';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import StoreProvider from '../src/Store';
import 'bootstrap/dist/css/bootstrap.min.css';
// import 'react-confirm-alert/src/react-confirm-alert.css';
// const root = ReactDOM.createRoot(document.getElementById('root'));
// const root = createRoot(document.getElementById('root'));
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>
);

reportWebVitals();

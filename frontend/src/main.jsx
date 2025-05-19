// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/*  Activamos los flags de la futura v7
    - v7_startTransition   → envolverá las updates en React.startTransition
    - v7_relativeSplatPath → nuevo cálculo para rutas con * (splat)
*/
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <App />
  </BrowserRouter>
);

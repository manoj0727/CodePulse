// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// import './index.css'; // Optional, if you have global styles

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
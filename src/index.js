import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ✅ App must have a default export
import './index.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

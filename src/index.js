import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // ADD THIS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// ✅ ADD THIS LINE FOR PWA
serviceWorkerRegistration.register();

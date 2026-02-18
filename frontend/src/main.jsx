import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Remove loading screen when React mounts
const removeLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.3s';
    setTimeout(() => loadingScreen.remove(), 300);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Remove loading screen after React renders
setTimeout(removeLoadingScreen, 100);

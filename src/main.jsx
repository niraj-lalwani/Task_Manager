import React, { StrictMode } from 'react'
import AuthProvider from './context/AuthContext.jsx'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import { registerSW } from 'virtual:pwa-register';
// registerSW();


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

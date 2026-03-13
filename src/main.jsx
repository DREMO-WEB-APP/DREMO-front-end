import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </NotificationProvider>
  </React.StrictMode>,
)

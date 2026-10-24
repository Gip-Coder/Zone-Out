import React from 'react'
import ReactDOM from 'react-dom/client'

import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { ProgressProvider } from './context/ProgressContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  // Honour the OS "reduce motion" setting for all framer-motion animations
  <MotionConfig reducedMotion="user">
    <ThemeProvider>
      <ToastProvider>
        <ProgressProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ProgressProvider>
      </ToastProvider>
    </ThemeProvider>
  </MotionConfig>
)

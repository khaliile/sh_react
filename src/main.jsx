import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import { runMigrations } from './utils/migrations'

// Run all one-time data migrations synchronously before React renders.
// This guarantees every component sees already-migrated localStorage data.
runMigrations();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
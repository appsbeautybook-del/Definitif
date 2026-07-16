import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Override base44.integrations.Core.InvokeLLM → GLM backend
import '@/lib/base44Shim.js'

// Appliquer le thème sauvegardé dès le démarrage
import { applyTheme } from "@/hooks/useTheme";
applyTheme(localStorage.getItem("bb_theme") || "light");

// Appliquer la langue sauvegardée dès le démarrage
import { setGlobalLang } from "@/hooks/useLocale";
setGlobalLang(localStorage.getItem("bb_lang") || "fr");

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom' //Enables client-side routing (e.g., /home, /profile).
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx' //    A context provider for managing authentication state (e.g., user login status).

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
)

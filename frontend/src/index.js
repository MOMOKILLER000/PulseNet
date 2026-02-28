import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";   // ✅ ADD THIS

const clientID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <GoogleOAuthProvider clientId={clientID}>
        <BrowserRouter> {/* ✅ ADD THIS */}
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </BrowserRouter>
    </GoogleOAuthProvider>
);

reportWebVitals();
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google"


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="714025615759-71g1n73td74shfbq8rdmq4c1goic7eoo.apps.googleusercontent.com">
        <App />
        </GoogleOAuthProvider>
  </React.StrictMode>
);


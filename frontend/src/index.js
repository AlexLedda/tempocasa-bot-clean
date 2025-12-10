import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { registerServiceWorker, setupInstallPrompt, setupOnlineStatus } from "@/utils/pwa";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Initialize PWA features
registerServiceWorker();
setupInstallPrompt();
setupOnlineStatus();

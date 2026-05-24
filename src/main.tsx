
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { initSentry } from "./lib/sentry";

initSentry();

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode>
 <ThemeProvider>
 <App />
 </ThemeProvider>
 </React.StrictMode>
);

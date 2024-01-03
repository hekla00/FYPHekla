import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { SplashScreen } from "@capacitor/splash-screen";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

SplashScreen.hide();

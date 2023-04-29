import React from "react";
import ReactDOM from "react-dom/client";

import { Routes } from "./Routes.generated";

export function Root() {
  return (
    <div>
      <h1>CrumbVault</h1>
      <hr />
      <Routes />
    </div>
  );
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("No container found");
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

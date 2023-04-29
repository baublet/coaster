import React from "react";
import ReactDOM from "react-dom/client";

import { AsyncComponent } from "@baublet/coaster/react-components";

export function Todo() {
  const [show, setShow] = React.useState(false);

  return (
    <div>
      <h1>Todo</h1>
      <hr />
      <button onClick={() => setShow(!show)}>Toggle</button>
      <hr />
      {show && (
        <>
          <h2>Async Component</h2>
          <AsyncComponent
            loadFn={() => import("./AnotherComponent")}
            exportName="AnotherComponent"
            componentProps={{ foo: "bar" }}
          />
        </>
      )}
    </div>
  );
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("No container found");
}

const root = ReactDOM.createRoot(container);
root.render(<Todo />);

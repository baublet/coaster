import React from "react";
import ReactDOM from "react-dom";

import { AsyncComponent } from "./AsyncComponent";

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

ReactDOM.render(<Todo />, document.getElementById("root"));

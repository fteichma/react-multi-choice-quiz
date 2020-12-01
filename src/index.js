import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import * as serviceWorker from "./serviceWorker";

import Admin from "./components/Admin";
import Firebase, { FirebaseContext } from "./components/Firebase";

ReactDOM.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <Admin />
  </FirebaseContext.Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();

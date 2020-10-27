import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router } from "react-router-dom";

import Root from "./Root";
import Firebase, { FirebaseContext } from "./components/Firebase";

ReactDOM.render(
  <Router>
    <FirebaseContext.Provider value={new Firebase()}>
      <Root />
    </FirebaseContext.Provider>
  </Router>,
  document.getElementById("root")
);

serviceWorker.unregister();

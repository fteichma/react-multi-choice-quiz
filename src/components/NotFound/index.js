import React from "react";
import { useHistory } from "react-router-dom";

function Notfound() {
  let history = useHistory();
  let goHome = () => {
    history.push("/");
  };
  return (
    <div>
      <h1>You are lost in space - 404</h1>
      <button onClick={() => goHome()}>Go home</button>
    </div>
  );
}
export default Notfound;

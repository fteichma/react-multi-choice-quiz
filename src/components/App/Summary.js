import React from "react";
import ReactHtmlParser from "react-html-parser";

function Summary(props) {
  return (
    <div
      className="thankYou"
      style={{
        backgroundColor: props?.custom?.bgColor,
        color: props?.custom?.textColor?.title,
      }}
    >
      {ReactHtmlParser(props.summaryHtml ?? "")}
    </div>
  );
}

export default Summary;

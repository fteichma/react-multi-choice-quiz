import React from "react";
import ReactHtmlParser from "react-html-parser";

function htmlDecode(input) {
  if (input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }
  return;
}

function Summary(props) {
  console.log(props.summaryHTML);
  return (
    <div
      className="thankYou"
      style={{
        backgroundColor: props?.custom?.bgColor,
        color: props?.custom?.textColor?.title,
      }}
    >
      {props.summaryHtml ? ReactHtmlParser(JSON.parse(props.summaryHtml)) : ""}
    </div>
  );
}

export default Summary;

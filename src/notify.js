import React from "react";
import { toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ErrorOutlineRounded,
  ReportProblemOutlined,
  CheckCircleOutlineRounded,
  InfoOutlined,
  CloseRounded,
} from "@material-ui/icons";
const Notify = (txt = "Success!", type = "success", btn, action) => {
  toast(
    <div
      style={{
        margin: "1em",
      }}
    >
      <p
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "1em",
          fontSize: 14,
          color: "white",
        }}
      >
        {type === "success" && (
          <CheckCircleOutlineRounded
            style={{
              marginRight: "0.5em",
            }}
          />
        )}
        {type === "warning" && (
          <ReportProblemOutlined
            style={{
              marginRight: "0.5em",
            }}
          />
        )}

        {type === "error" && (
          <ErrorOutlineRounded
            style={{
              marginRight: "0.5em",
            }}
          />
        )}
        {type === "info" && (
          <InfoOutlined
            style={{
              marginRight: "0.5em",
            }}
          />
        )}
        {txt}
      </p>
      {btn && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1em",
          }}
        >
          <a
            style={{
              color: "white",
              ":hover": {
                color: "white",
              },
            }}
            href={action}
          >
            {btn.toUpperCase()}
          </a>
        </div>
      )}
    </div>,
    {
      position: "top-right",
      transition: Slide,
      closeButton: <CloseRounded fontSize="small" />,
      type:
        type === "success"
          ? toast.TYPE.SUCCESS
          : type === "warning"
          ? toast.TYPE.WARNING
          : type === "error"
          ? toast.TYPE.ERROR
          : type === "info"
          ? toast.TYPE.INFO
          : type === "default",
      autoClose: 3000,
    }
  );
};

export default Notify;

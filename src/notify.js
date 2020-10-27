import React from "react";
import { toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Icon from "react-feather";

const Notify = (txt = "Success!", type = "success", btn, action) => {
  var autoCloseDelay = 0;
  if (type === "success") autoCloseDelay = 2000;
  else if (type === "alert") autoCloseDelay = 5000;
  else {
    autoCloseDelay = 5000;
  }

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
        }}
      >
        {type === "success" && (
          <Icon.CheckCircle
            size={18}
            style={{
              marginRight: "0.75em",
            }}
          />
        )}
        {type === "warning" && (
          <Icon.AlertTriangle
            size={18}
            style={{
              marginRight: "0.75em",
            }}
          />
        )}

        {type === "error" && (
          <Icon.X
            size={18}
            style={{
              marginRight: "0.75em",
            }}
          />
        )}
        {type === "info" && (
          <Icon.Info
            size={18}
            style={{
              marginRight: "0.75em",
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
      closeButton: <Icon.X size={16} />,
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
      // ? type === 'error'
      // : toast.TYPE.INFO
      // ? type === 'info',
      autoClose: autoCloseDelay,
    }
  );
};

export default Notify;

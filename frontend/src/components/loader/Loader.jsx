import React from "react";
import "./Loader.css";
import ReactDOM from "react-dom";
import loaderImg from "../../assets/loader.gif";
export const Loader = () => {
  return ReactDOM.createPortal(
    <div className="wrapper">
      <div className="loader">
        <img src={loaderImg} alt="Loading..." />
      </div>
    </div>,
    document.getElementById("loader")
  );
};
export const Spinner = () => {
  return (
    <div className="--center-all">
      <img src={loaderImg} alt="Loading..." />
    </div>
  );
};

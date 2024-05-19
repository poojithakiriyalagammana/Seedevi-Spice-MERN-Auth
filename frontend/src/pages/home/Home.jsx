import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/header/Header";

export const Home = () => {
  return (
    <div>
      <Header />
      <h2>Home</h2>
      <Link to="/login">
        <button>
          <h1>Login</h1>
        </button>
      </Link>
    </div>
  );
};

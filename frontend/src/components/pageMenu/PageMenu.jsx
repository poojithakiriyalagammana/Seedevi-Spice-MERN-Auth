import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./PageMenu.css";
import { AdminOwnerLink } from "../protect/hiddenLink";

export const PageMenu = () => {
  return (
    <div>
      <nav className="--btn-google --p --mb">
        <ul className="home-linkss">
          <li>
            <NavLink to="/profile">Profile</NavLink>
          </li>
          <li>
            <NavLink to="/changePassword">Change Pssword</NavLink>
          </li>
          <AdminOwnerLink>
            <li>
              <NavLink to="/users">Users</NavLink>
            </li>
          </AdminOwnerLink>
        </ul>
      </nav>
    </div>
  );
};

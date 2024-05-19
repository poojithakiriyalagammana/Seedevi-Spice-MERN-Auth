import React, { useState } from "react";
import "./ChangeRole.css";
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { getUsers, upgradeUser } from "../../redux/features/auth/authSlice";
import {
  EMAIL_RESET,
  sendAutomatedEmail,
} from "../../redux/features/email/emailSlice";

export const ChangeRole = ({ _id, email }) => {
  const [userRole, setUserRole] = useState("");
  const dispatch = useDispatch();

  //Upgrade User
  const changeRole = async (e) => {
    e.preventDefault();
    if (!userRole) {
      toast.error("Please select a role");
    }
    const userData = {
      role: userRole,
      id: _id,
    };

    const emailData = {
      subject: "Account Role Changed -Seedevi Spice",
      send_to: email,
      reply_to: "noreply@seedeviSpice",
      template: "changeRole",
      url: "/login",
    };
    await dispatch(upgradeUser(userData));
    await dispatch(sendAutomatedEmail(emailData));
    await dispatch(getUsers());
    dispatch(EMAIL_RESET());
  };
  return (
    <div className="sort">
      <form
        className="--flex-start"
        onSubmit={(e) => changeRole(e, _id, userRole)}
      >
        <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="subscriber">Subscriber</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
          <option value="suspended">Suspended</option>
        </select>
        <button className="button2">
          <FaCheck size={15} />
        </button>
      </form>
    </div>
  );
};

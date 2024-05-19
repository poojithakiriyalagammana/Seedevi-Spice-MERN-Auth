import React, { useState } from "react";
import "./ChangePassword.css";

import { PageMenu } from "../../components/pageMenu/PageMenu";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import { useRedirectLoggedOutUser } from "../../customHook/useRedirectLoggedOutUser";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  RESET,
  changePassword,
  logout,
} from "../../redux/features/auth/authSlice";
import { Spinner } from "../../components/loader/Loader";
import { sendAutomatedEmail } from "../../redux/features/email/emailSlice";
import changeIMG from "../../assets/change_password.jpeg";

const initialState = {
  oldPassword: "",
  password: "",
  password2: "",
};
export const ChangePassword = () => {
  useRedirectLoggedOutUser("/login");

  const [formData, setFormData] = useState(initialState);
  const { oldPassword, password, password2 } = formData;

  const { isLoading, user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !password || !password2) {
      return toast.error("All fields are required");
    }

    if (password !== password2) {
      return toast.error("Password do not match");
    }
    const userData = {
      oldPassword,
      password,
    };

    const emailData = {
      subject: "Password Chenged -Seedevi Spice",
      send_to: user.email,
      reply_to: "noreply@seedeviSpice",
      template: "changePassword",
      url: "/forgot",
    };
    await dispatch(changePassword(userData));
    await dispatch(sendAutomatedEmail(emailData));
    await dispatch(logout());
    await dispatch(RESET(userData));
    navigate("/login");
  };
  return (
    <section className="changePassword-section">
      <img className="changeIMG" src={changeIMG} alt="" />
      <div className="container">
        <PageMenu />
        <h2>Change Password</h2>
        <div className="--flex-start change-password">
          <div className="card">
            <div className="card2">
              <form onSubmit={updatePassword}>
                <p>
                  <label> Current Password</label>
                  <PasswordInput
                    name="oldPassword"
                    value={oldPassword}
                    onChange={handleInputChange}
                    placeholder="Old Password"
                  />
                </p>
                <p>
                  <label> New Passowrd:</label>
                  <PasswordInput
                    name="password"
                    value={password}
                    onChange={handleInputChange}
                    placeholder="New Password"
                  />
                </p>
                <p>
                  <label> Confirm New Passowrd:</label>
                  <PasswordInput
                    name="password2"
                    value={password2}
                    onChange={handleInputChange}
                    placeholder="Confirm New Password"
                  />
                </p>
                {isLoading ? (
                  <Spinner />
                ) : (
                  <button
                    type="submit"
                    className="--btn --btn-danger --btn-block"
                  >
                    Change Password
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

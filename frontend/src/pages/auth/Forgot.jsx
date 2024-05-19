import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";
import { RiLoginBoxFill } from "react-icons/ri";
import { MdOutlineAttachEmail } from "react-icons/md";
import { toast } from "react-toastify";
import { validateEmail } from "../../redux/features/auth/authService";
import { useDispatch, useSelector } from "react-redux";
import { RESET, forgotPassword } from "../../redux/features/auth/authSlice";
import { Loader } from "../../components/loader/Loader";

export const Forgot = () => {
  const [email, setEmail] = useState("");

  const dispatch = useDispatch();

  const { isLoading } = useSelector((state) => state.auth);

  const forgot = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error("Please enter an email");
    }
    if (!validateEmail(email)) {
      return toast.error("Please enter valid email");
    }

    const userData = {
      email,
    };

    await dispatch(forgotPassword(userData));
    await dispatch(RESET(userData));
  };

  return (
    <div className="login-container">
      {isLoading && <Loader />}
      <div className="login">
        <div className="--flex-center">
          <MdOutlineAttachEmail size={35} />
        </div>
        <h2>Forgot Password</h2>

        <form onSubmit={forgot}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          <button type="submit" className="--btn--btn-primary--btn-block">
            Get Reset Email
          </button>
        </form>
        <span className="register">
          <Link to="/">Home</Link>
          <p>&nbsp; Already have an account? &nbsp;</p>
          <Link to="/login">Login</Link>
        </span>
      </div>
    </div>
  );
};

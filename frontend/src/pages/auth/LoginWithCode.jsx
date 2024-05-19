import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Auth.css";
import { RiLoginBoxFill } from "react-icons/ri";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import {
  RESET,
  loginWithCode,
  sendLoginCode,
} from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { Loader } from "../../components/loader/Loader";

export const LoginWithCode = () => {
  const [loginCode, setLoginCode] = useState("");
  const { email } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isLoggedIn, isSuccess } = useSelector(
    (state) => state.auth
  );

  const sendUserLoginCode = async () => {
    await dispatch(sendLoginCode(email));
    await dispatch(RESET());
  };

  const loginUserWithCode = async (e) => {
    e.preventDefault();
    if (loginCode === "") {
      return toast.error("Please fill in login access code");
    }
    if (loginCode.length !== 6) {
      return toast.error("Access code must be 6 characters");
    }
    const code = {
      loginCode,
    };
    await dispatch(loginWithCode({ code, email }));
    await dispatch(RESET());
  };
  useEffect(() => {
    if (isLoggedIn && isSuccess) {
      navigate("/profile");
    }
    dispatch(RESET());
  }, [isSuccess, isLoggedIn, navigate, dispatch]);

  return (
    <div className="login-container">
      {isLoading && <Loader />}
      <div className="login">
        <div className="--flex-center">
          <FaUnlockKeyhole size={35} />
        </div>
        <h2>Enter Access Code</h2>

        <form onSubmit={loginUserWithCode}>
          <input
            type="text"
            name="loginCode"
            value={loginCode}
            onChange={(e) => setLoginCode(e.target.value)}
            placeholder="Access Code"
            required
          />

          <button type="submit" className="--btn--btn-primary--btn-block">
            Proceed To Login
          </button>
          <span>Check your email for login access code</span>
        </form>
        <span className="register">
          <Link to="/">- Home -</Link>
          <p>&nbsp; &nbsp;</p>
          <p onClick={sendUserLoginCode} className="v-link --color-primary">
            <b>Resend Code</b>
          </p>
        </span>
      </div>
    </div>
  );
};

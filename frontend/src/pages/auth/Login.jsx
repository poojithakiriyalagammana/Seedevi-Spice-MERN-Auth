import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css"; // Change import path
import { RiLoginBoxFill } from "react-icons/ri";
import PasswordInput from "../../components/PasswordInput/PasswordInput"; // Assuming you're using PasswordInput component
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { validateEmail } from "../../redux/features/auth/authService";
import { Loader } from "../../components/loader/Loader"; // Assuming you're using Loader component
import {
  RESET,
  login,
  loginWithGoogle,
  sendLoginCode,
} from "../../redux/features/auth/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import loginIMG from "../../assets/loginimg.jpeg";

const initialState = {
  email: "",
  password: "",
};

export const Login = () => {
  const [formData, setFormData] = useState(initialState);
  const { email, password } = formData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isLoggedIn, isSuccess, isError, twoFactor } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess || isLoggedIn) {
      navigate("/profile");
    }
    if (isError && twoFactor) {
      dispatch(sendLoginCode(email));
      navigate(`/loginWithCode/${email}`);
    }
    dispatch(RESET());
  }, [isLoggedIn, isSuccess, dispatch, navigate, isError, twoFactor, email]);

  const loginUserHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("All fields are required");
    }
    if (!validateEmail(email)) {
      return toast.error("Please enter a valid email");
    }

    const userData = {
      email,
      password,
    };

    await dispatch(login(userData));
  };

  const googleLoginHandler = async (credentialResponse) => {
    console.log(credentialResponse);
    await dispatch(
      loginWithGoogle({ userToken: credentialResponse.credential })
    );
  };

  return (
    <section className="section-login">
      {" "}
      <img className="login-IMG" src={loginIMG} alt="" />
      <div className="login-container">
        {isLoading && <Loader />}
        <div className="login">
          <div className="--flex-center">
            <RiLoginBoxFill size={35} />
          </div>
          <h2>Login</h2>
          <div className="--flex-center">
            <GoogleLogin
              onSuccess={googleLoginHandler}
              onError={() => {
                console.log("Login Failed");
                toast.error("Login Failed");
              }}
            />
          </div>
          <br />
          <p className="--text-center--fw-bold">or</p>
          <form onSubmit={loginUserHandler}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
            <PasswordInput
              name="password"
              value={password}
              onChange={handleInputChange}
              placeholder="Password"
            />
            <button type="submit" className="--btn--btn-primary--btn-block">
              Login
            </button>
          </form>
          <Link to="/forgot">Forgot Password</Link>
          <span className="register">
            <Link to="/">Home</Link>
            <p>&nbsp;Don't have an account?&nbsp;</p>
            <Link to="/register">Register</Link>
          </span>
        </div>
      </div>
    </section>
  );
};

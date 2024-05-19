import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Auth.css";
import { MdPassword } from "react-icons/md";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import { Loader } from "../../components/loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RESET, resetPassword } from "../../redux/features/auth/authSlice";

const initialState = {
  password: "",
  password2: "",
};
export const Reset = () => {
  const [formData, setFormData] = useState(initialState);
  const { password, password2 } = formData;

  const { resetToken } = useParams();
  console.log(resetToken);

  const { isLoading, isLoggedIn, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const reset = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("Password must be up to 6 characters");
    }
    if (password !== password2) {
      return toast.error("Password do not match");
    }

    const userData = {
      password,
    };

    await dispatch(resetPassword({ userData, resetToken }));
  };
  useEffect(() => {
    if (isSuccess || message.includes("Reset Successful")) {
      navigate("/login");
    }
    dispatch(RESET());
  }, [dispatch, navigate, message, isSuccess]);

  return (
    <div className="login-container">
      {isLoading && <Loader />}
      <div className="login">
        <div className="--flex-center">
          <MdPassword size={35} />
        </div>
        <h2>Reset Password</h2>

        <form onSubmit={reset}>
          <PasswordInput
            name="password"
            value={password}
            onChange={handleInputChange}
            placeholder="Password"
          />
          <PasswordInput
            name="password2"
            value={password2}
            onChange={handleInputChange}
            placeholder="Confirm Password"
          />

          <button type="submit" className="--btn--btn-primary--btn-block">
            Reset Password
          </button>
        </form>
        <span className="register">
          <Link to="/">- Home - </Link>

          <p>&nbsp; &nbsp;</p>
          <Link to="/login">- Login - </Link>
        </span>
      </div>
    </div>
  );
};

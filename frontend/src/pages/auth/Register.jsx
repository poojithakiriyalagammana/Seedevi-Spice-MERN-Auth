import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { IoMdPersonAdd } from "react-icons/io";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import { ImCross } from "react-icons/im";
import { BsCheck2All } from "react-icons/bs";
import { toast } from "react-toastify";
import {
  RESET,
  register,
  sendVerificationEmail,
} from "../../redux/features/auth/authSlice";
import { validateEmail } from "../../redux/features/auth/authService";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "../../components/loader/Loader";
import registerIMG from "../../assets/registerIMG.jpg";
const initialState = {
  name: "",
  email: "",
  password: "",
  password2: "",
};
export const Register = () => {
  const [formData, setFormData] = useState(initialState);
  const { name, email, password, password2 } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isLoggedIn, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const [uCase, setUCase] = useState(false);
  const [num, setNum] = useState(false);
  const [sChar, setSChar] = useState(false);
  const [passLength, setPassLength] = useState(false);

  const timesIcon = <ImCross color="red" size={10} />;
  const CheckIcon = <BsCheck2All color="green" size={15} />;

  const switchIcon = (condition) => {
    if (condition) {
      return CheckIcon;
    }
    return timesIcon;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  useEffect(() => {
    //check Lower and UpperCase
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
      setUCase(true);
    } else {
      setUCase(false);
    }
    //check Numbers
    if (password.match(/([0-9])/)) {
      setNum(true);
    } else {
      setNum(false);
    }
    //Check For Special char
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
      setSChar(true);
    } else {
      setSChar(false);
    }
    //Check For Length
    if (password.length > 5) {
      setPassLength(true);
    } else {
      setPassLength(false);
    }
  }, [password]);
  const registerUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error("All fields are required");
    }
    if (password.length < 6) {
      return toast.error("Password must be up to 6 characters");
    }
    if (!validateEmail(email)) {
      return toast.error("Please enter valid email");
    }
    if (password !== password2) {
      return toast.error("Password do not match");
    }

    const userData = {
      name,
      email,
      password,
    };
    //console.log(userData);
    await dispatch(register(userData));
    await dispatch(sendVerificationEmail());
  };
  useEffect(() => {
    if (isSuccess || isLoggedIn) {
      navigate("/profile");
    }
    dispatch(RESET());
  }, [isLoggedIn, isSuccess, dispatch, navigate]);

  return (
    <section className="section-register">
      <img className="registerimg" src={registerIMG} alt="" />
      <div className="login-container">
        {isLoading && <Loader />}
        <div className="login">
          <div className="--flex-center">
            <IoMdPersonAdd size={35} />
          </div>
          <h2>Register</h2>

          <form onSubmit={registerUser}>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleInputChange}
              placeholder="Name"
              required
            />
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
            <PasswordInput
              name="password2"
              value={password2}
              onChange={handleInputChange}
              placeholder="Confirm Password"
              onPaste={(e) => {
                e.preventDefault();
                toast.error("Can not paste in to input field");
                return false;
              }}
            />
            {/* Password Stength */}
            <div className="CardStength">
              <ul className="form-list">
                <li>
                  <span className="indicators">
                    {switchIcon(uCase)}
                    &nbsp;LowerCase & UpperCase
                  </span>
                </li>
                <li>
                  <span className="indicators">
                    {switchIcon(num)}
                    &nbsp;Number (0-9)
                  </span>
                </li>
                <li>
                  <span className="indicators">
                    {switchIcon(sChar)}
                    &nbsp;Special Character (!@&#$*%)
                  </span>
                </li>
                <li>
                  <span className="indicators">
                    {switchIcon(passLength)}
                    &nbsp;At least 6 Character
                  </span>
                </li>
              </ul>
            </div>

            <button type="submit" className="--btn--btn-primary--btn-block">
              Register
            </button>
          </form>

          <span className="register">
            <Link to="/">Home</Link>
            <p>&nbsp; Already have an account? &nbsp;</p>
            <Link to="/login">Login</Link>
          </span>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Header.css";
import { useDispatch } from "react-redux";
import { RESET, logout } from "../../redux/features/auth/authSlice";
import { ShowOnLogin, ShowOnLogout } from "../protect/hiddenLink";
import { UserName } from "../../pages/profile/Profile";
import seedeviImg from "../../assets/Seedevi_Spice.png";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const goHome = () => {
    navigate("/");
  };

  const logOutUser = async () => {
    await dispatch(logout());
    dispatch(RESET());
    navigate("/login");
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const ActiveLink = ({ isActive }) => (isActive ? "active" : "");

  return (
    <header className="header">
      <nav>
        {/* LOGO */}
        <div className="logo" onClick={goHome}>
          <img src={seedeviImg} alt="" />
        </div>
        <div className="middle-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/about">About</Link>
          <Link to="/blog">Blog</Link>
          <ShowOnLogin>
            <Link to="/cart">Cart</Link>
          </ShowOnLogin>
        </div>
        {/* ({cart.length}) */}
        {/* Hamburger Menu Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          &#9776;
        </div>
        {/* Navigation Links */}
        <ul className={`home-links ${menuOpen ? "show" : ""}`}>
          <ShowOnLogin>
            <li className="--flex-center">
              <FaUserCircle size={20} />
              <UserName />
            </li>
          </ShowOnLogin>
          <ShowOnLogout>
            <li>
              <button className="--btn --btn-primary">
                <Link to="/login">Login</Link>
              </button>
            </li>
          </ShowOnLogout>
          <ShowOnLogin>
            <li>
              <NavLink to="/profile" className={ActiveLink}>
                Profile
              </NavLink>
            </li>
            <li>
              <button onClick={logOutUser} className="--btn --btn-secondary">
                <Link>Logout</Link>
              </button>
            </li>
          </ShowOnLogin>
        </ul>
      </nav>
    </header>
  );
}

export default Header;

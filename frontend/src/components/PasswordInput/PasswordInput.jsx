import React, { useState } from "react";
import "./PasswordInput.css";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ placeholder, value, onChange, name, onPaste }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="pppp">
      <div className="password">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          onPaste={onPaste}
        />
        <div className="iconEye" onClick={togglePassword}>
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </div>
      </div>
    </div>
  );
};

export default PasswordInput;

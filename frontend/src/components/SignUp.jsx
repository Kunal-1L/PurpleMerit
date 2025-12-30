import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import style from "./SignUp.module.css";

const API_URL = import.meta.env.VITE_API_URL;

const SignUp = () => {
  const userNameRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const confirmPasswordRef = React.useRef(null);
  
  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      const submitButton = event.target.querySelector(
        'button[type="submit"]'
      );
      submitButton.disabled = true;

      const username = userNameRef.current.value;
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const confirmPassword = confirmPasswordRef.current.value;

      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }

      if (username.length < 3 || username.length > 20) {
        toast.error("Username must be between 3 and 20 characters long!");
        return;
      }

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        toast.error(
          "Password must be at least 8 characters long and contain at least one letter and one number!"
        );
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Invalid email format!");
        return;
      }

      const response = await axios.post(`${API_URL}/signup`, {
        user_name: username,
        user_email: email,
        user_password: password,
      });

      if (response.status === 201) {
        toast.success("Signup successful! Please log in.");
      } else {
        toast.error(response.data.message || "Signup failed!");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "An error occurred during signup."
      );
    } finally {
      const submitButton = event.target.querySelector(
        'button[type="submit"]'
      );
      submitButton.disabled = false;
    }
  };

  return (
    <div className={style.signupContainer}>
      <div className={style.signupCard}>
        <h2 className={style.heading}>Create Account</h2>
        <p className={style.subText}>
          Join PurpleMerit and manage users effortlessly
        </p>

        <form onSubmit={handleSubmit} className={style.form}>
          <div className={style.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              ref={userNameRef}
              required
            />
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              ref={emailRef}
              required
            />
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              ref={passwordRef}
              required
            />
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              ref={confirmPasswordRef}
              required
            />
          </div>

          <button type="submit" className={style.signupBtn}>
            Sign Up
          </button>
        </form>

        <div className={style.footerText}>
          Already have an account? <a href="/login">Log In</a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

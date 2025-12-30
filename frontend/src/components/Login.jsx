import { useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import style from "./Login.module.css";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      const submitButton = event.target.querySelector(
        'button[type="submit"]'
      );
      submitButton.disabled = true;

      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      const response = await axios.post(`${API_URL}/login`, {
        user_email: email,
        user_password: password,
      });

      if (response.status === 200) {
        toast.success("Login successful!");
        sessionStorage.setItem("token", response.data.token);
        // Notify other parts of the app in the same tab that auth changed
        window.dispatchEvent(new Event("auth"));

        if (response.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/profile");
        }
      } else {
        toast.error(response.data.message || "Login failed!");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "An error occurred during login."
      );
    } finally {
      const submitButton = event.target.querySelector(
        'button[type="submit"]'
      );
      submitButton.disabled = false;
    }
  };

  return (
    <div className={style.loginContainer}>
      <div className={style.loginCard}>
        <h2 className={style.heading}>Welcome Back</h2>
        <p className={style.subText}>Login to continue to PurpleMerit</p>

        <form onSubmit={handleSubmit} className={style.form}>
          <div className={style.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              ref={emailRef}
              required
            />
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              ref={passwordRef}
              required
            />
          </div>

          <button type="submit" className={style.loginBtn}>
            Login
          </button>
        </form>

        <div className={style.footerText}>
          Don&apos;t have an account? <a href="/signup">Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;

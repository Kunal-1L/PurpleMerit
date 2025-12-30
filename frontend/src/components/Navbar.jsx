import { useState, useEffect } from "react";
import style from "./Navbar.module.css";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!sessionStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for a custom 'auth' event dispatched on login/logout within the same tab
    window.addEventListener("auth", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth", handleStorageChange);
    };
  }, []);

  const handleLogOutClick = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.href = "/";
  };
  const handleProfileClick = () => {
    navigate("/profile");
  }

  return (
    <nav className={style.navbar}>
      <div className={style.logo} onClick={()=> navigate('/')}>PurpleMerit</div>

      <div className={style.navActions}>
        {!isAuthenticated && (
          <>
            <button
              className={style.loginBtn}
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>

            <button
              className={style.signupBtn}
              onClick={() => (window.location.href = "/signup")}
            >
              Sign Up
            </button>
          </>
        )}

        {isAuthenticated && (
          <>
          <button onClick={handleProfileClick} className={style.profileBtn}>
            Profile
          </button>
          <button
            className={style.logoutBtn}
            onClick={handleLogOutClick}
          >
            Log Out
          </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

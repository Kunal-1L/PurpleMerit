import Login from "./components/Login.jsx";
import SignUp from "./components/SignUp.jsx";
import Home from "./components/Home.jsx";
import Profile from "./components/Profile.jsx";
import Admin from "./components/Admin.jsx";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
};


export default App;
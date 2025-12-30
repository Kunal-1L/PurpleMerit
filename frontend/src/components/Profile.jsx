import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import style from "./Profile.module.css";
import Loading from "./Loading";

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    new_name: "",
    new_email: "",
    current_password: "",
    new_password: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(res.data.userProfile);
        setFormData({
          new_name: res.data.userProfile.name,
          new_email: res.data.userProfile.email,
          current_password: "",
          new_password: "",
        });
      } catch {
        navigate("/login");
      } finally{
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {};

      if (formData.new_name !== profile.name) payload.new_name = formData.new_name;
      if (formData.new_email !== profile.email) payload.new_email = formData.new_email;

      if (formData.current_password && formData.new_password) {
        payload.current_password = formData.current_password;
        payload.new_password = formData.new_password;
      }

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to update");
        return;
      }

      await axios.put(`${API_URL}/update-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile updated successfully");
      setProfile({ ...profile, ...payload });
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      new_name: profile.name,
      new_email: profile.email,
      current_password: "",
      new_password: "",
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={style.profileContainer}>
      <h2 className={style.profileTitle}>User Profile</h2>

      {/* BASIC INFO */}
      <div className={style.section}>
        <label className={style.label}>Full Name</label>
        <input
          className={style.input}
          type="text"
          name="new_name"
          value={formData.new_name}
          onChange={handleChange}
        />

        <label className={style.label}>Email</label>
        <input
          className={style.input}
          type="email"
          name="new_email"
          value={formData.new_email}
          onChange={handleChange}
        />
        <div className={style.role}>Role: {profile.role}</div>
      </div>

      {/* PASSWORD */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>Change Password</h4>

        <input
          className={style.input}
          type="password"
          name="current_password"
          placeholder="Current Password"
          value={formData.current_password}
          onChange={handleChange}
        />

        <input
          className={style.input}
          type="password"
          name="new_password"
          placeholder="New Password"
          value={formData.new_password}
          onChange={handleChange}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className={style.actions}>
        <button className={style.saveBtn} onClick={handleSave}>
          Save
        </button>
        <button className={style.cancelBtn} onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Profile;

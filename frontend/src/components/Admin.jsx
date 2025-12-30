import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import style from "./Admin.module.css";
import Loading from "./Loading";
const API_URL = import.meta.env.VITE_API_URL;

const Admin = () => {
  const token = sessionStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setUsers(response.data.users);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        window.location.href = "/login";
      }
      finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [token]);

  const handleActivation = async (selectedUser) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/user/${selectedUser._id}/status`,
        {
          status:
            selectedUser.user_status === "active" ? "inactive" : "active",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("User status updated successfully!");

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === selectedUser._id
              ? {
                  ...user,
                  user_status:
                    selectedUser.user_status === "active"
                      ? "inactive"
                      : "active",
                }
              : user
          )
        );
      }
    } catch (err) {
      console.error("Error updating user status:", err);
      toast.error("Failed to update user status.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className={style.adminContainer}>
      <div className={style.adminCard}>
        <h2 className={style.heading}>Admin Dashboard</h2>
        <p className={style.subText}>Manage all registered users</p>

        <div className={style.tableWrapper}>
          <table className={style.userTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.user_name}</td>
                  <td>{user.user_email}</td>
                  <td>
                    <span className={style.roleBadge}>
                      {user.user_role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        user.user_status === "active"
                          ? style.activeStatus
                          : style.inactiveStatus
                      }
                    >
                      {user.user_status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={style.actionBtn}
                      onClick={() => handleActivation(user)}
                    >
                      {user.user_status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className={style.emptyText}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;

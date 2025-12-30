require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
// Connect to MongoDB
mongoose
  .connect(DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

const { Users } = require("./model.js");
const app = express();

app.use(cors());
app.use(express.json());

// JWT Middleware
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access Denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const verified = jwt.verify(token, JWT_SECRET);
    req.user_id = verified.id;
    req.user_role = verified.role;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(400).json({ message: "Invalid or expired token." });
  }
};
// API to signup user

app.post("/signup", async (req, res) => {
  try {
    const { user_email, user_password, user_name } = req.body;

    // Check if user already exists
    const existingUser = await Users.findOne({ user_email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);
    // Create new user (do not issue JWT here)
    const newUser = await Users.create({
      user_email,
      user_password: hashedPassword,
      user_name,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Return success and basic user info (no token)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        email: newUser.user_email,
        name: newUser.user_name,
        role: newUser.user_role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to login user
app.post("/login", async (req, res) => {
  try {
    const { user_email, user_password } = req.body;
    // Find user by email
    const user = await Users.findOne({ user_email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    } else {
      // Update last login timestamp
      try {
        user.lastLoginTimestamp = new Date();
        await user.save();
      } catch (e) {
        console.error("Failed to update lastLoginTimestamp:", e);
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user._id, role: user.user_role },
        JWT_SECRET,
        { expiresIn: "2h" }
      );
      res.status(200).json({
        token,
        user: {
          email: user.user_email,
          name: user.user_name,
          role: user.user_role,
        },
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to get profile
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const user = await Users.findById(userId).select("-user_password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({
        userProfile: {
          email: user.user_email,
          name: user.user_name,
          role: user.user_role,
        },
      });
    }
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to update name, email or password
app.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { new_name, new_email, current_password, new_password } = req.body;

    if (!new_name && !new_email && !new_password) {
      return res.status(400).json({ message: "No fields provided to update" });
    }
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (new_name && new_name !== user.user_name) {
      user.user_name = new_name;
    }

    if (new_email && new_email !== user.user_email) {
      const emailExists = await Users.findOne({
        user_email: new_email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.user_email = new_email;
    }

    if (new_password) {
      if (!current_password) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }

      const isMatch = await bcrypt.compare(
        current_password,
        user.user_password
      );

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      user.user_password = hashedNewPassword;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: user.user_name,
        email: user.user_email,
        role: user.user_role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to change password
app.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { userId, old_password, new_password } = req.body;
    // Find user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      // Compare old password
      const isMatch = await bcrypt.compare(old_password, user.user_password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      user.user_password = hashedNewPassword;
      user.updated_at = new Date();
      await user.save();

      res.status(200).json({ message: "Password changed successfully" });
    }
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to get user details
app.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    // Find user by ID
    const user = await Users.findById(userId).select("-user_password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({ user });
    }
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to get all users (admin only) paginated
app.get("/users", verifyToken, async (req, res) => {
  try {
    if (req.user_role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const users = await Users.find({ user_role: { $ne: "admin" } })
      .select("-user_password")
      .skip(skip)
      .limit(limit);
    const totalUsers = await Users.countDocuments();
    res.status(200).json({
      users,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to activate or deactivate user (admin only)
app.put("/user/:id/status", verifyToken, async (req, res) => {
  try {
    if (req.user_role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const userId = req.params.id;
    const { status } = req.body; // expected values: "active" or "inactive"
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.user_status = status;
    user.updated_at = new Date();
    await user.save();
    res.status(200).json({ message: "User status updated successfully" });
  } catch (error) {
    console.error("Update User Status Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

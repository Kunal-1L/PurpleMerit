const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_email: { type: String, required: true, unique: true },
    user_password: { type: String, required: true },
    user_name: { type: String, required: true },
    user_role: { type: String, enum: ["admin", "user"], default: "user" },
    user_status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    lastLoginTimestamp: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Users = mongoose.model("Users", userSchema);

module.exports = {
  Users,
};


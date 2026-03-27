import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: [true, "Username is require"],
      unique: [true, "Username should be unique"],
    },
    email: {
      type: String,
      require: [true, "Email is require"],
      unique: [true, "Email should be unique"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      require: [true, "Password is require"],
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "https://ik.imagekit.io/webasifdotio/user_image.jpg",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
  next()
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // NOTE: these were `require:` (misspelled) on every field, which Mongoose
    // silently ignores — so none of them was actually validated.
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    bio: {
      type: String,
      default: "",
      maxlength: [280, "Bio must be 280 characters or fewer"],
    },
    profileImage: {
      type: String,
      default: "https://ik.imagekit.io/webasifdotio/user_image.jpg",
    },
    // Set whenever the password changes. authUser rejects any token issued
    // before this moment, which is what makes a password change evict
    // sessions on other devices — a JWT cannot otherwise be recalled.
    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Async pre-hooks resolve via the returned promise, so there is no next() to
// call. Hashing lives here so no controller ever handles a raw password.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;

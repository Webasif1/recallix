import userModel from "../models/user_model.js";
import { responseMessage } from "../utils/responseMessage.js";
import redis from "../config/cache.js";
import jwt from "jsonwebtoken";
import { passwordChangeKey } from "../middleware/auth.middleware.js";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: TOKEN_TTL_SECONDS * 1000,
};

const issueToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

/** The shape every auth endpoint returns for a user. */
const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  bio: user.bio,
  profileImage: user.profileImage,
  createdAt: user.createdAt,
});

export async function register(req, res) {
  const { username, email, password } = req.body;

  const isUserAlreadyExist = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExist) {
    return responseMessage(res, {
      status: 409,
      message: "With this email or username user already exist",
      success: false,
      error: "User already exist",
    });
  }

  const user = await userModel.create({ username, email, password });

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  responseMessage(res, {
    status: 200,
    message: "User has been created successfully",
    // Same shape as get-me, including createdAt: the client stores this
    // response as the session user, and the profile and dashboard both show
    // a "member since" date that was blank until the next full page load.
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return responseMessage(res, {
      status: 400,
      message: "Invalid email or password",
      success: false,
      error: "user not found",
    });
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return responseMessage(res, {
      status: 400,
      message: "Invalid email or password",
      success: false,
      error: "Incorrect password",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  responseMessage(res, {
    status: 200,
    message: "Login successfully",
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}

export async function getMe(req, res) {
  const userId = req.user.id;

  const user = await userModel.findById(userId).select("-password");

  if (!user) {
    return responseMessage(res, {
      status: 404,
      message: "User not found",
      success: false,
      err: "User not Found",
    });
  }

  responseMessage(res, {
    status: 200,
    message: "User details fetched successfully",
    success: true,
    data: user,
  });
}

export async function logout(req, res) {
  const token = req.cookies.token;

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  // Blacklist for the token's REMAINING lifetime. The old fixed 1h TTL let a
  // signed-out 7 day token become valid again an hour later.
  if (token) {
    try {
      const { exp } = jwt.decode(token) || {};
      const ttl = exp ? exp - Math.floor(Date.now() / 1000) : 0;

      if (ttl > 0) {
        await redis.set(token, "revoked", "EX", ttl);
      }
    } catch (err) {
      // Never fail a logout because the cache is unavailable — the cookie is
      // already cleared, which is the part the user can see.
      console.error("Logout blacklist write failed:", err.message);
    }
  }

  responseMessage(res, {
    status: 200,
    message: "Logged out successfully",
    success: true,
  });
}

/**
 * PATCH /api/auth/me — partial profile update.
 *
 * Email is deliberately NOT editable here: it is the login identifier, and
 * changing it safely requires confirming the new address first.
 *
 * Uses findOneAndUpdate rather than .save() on purpose. `password` is
 * select:false, so a document loaded without it would fail the (now real)
 * required validation on save for a field that was merely unselected. Update
 * validators only check the paths present in the update, which sidesteps that.
 */
export async function updateProfile(req, res) {
  const userId = req.user.id;
  const updates = {};

  if (typeof req.body.username === "string") {
    updates.username = req.body.username.trim();
  }

  if (typeof req.body.bio === "string") {
    updates.bio = req.body.bio.trim();
  }

  if (typeof req.body.profileImage === "string") {
    const image = req.body.profileImage.trim();
    // Empty means "put me back on the default avatar"
    updates.profileImage =
      image === ""
        ? userModel.schema.path("profileImage").defaultValue
        : image;
  }

  if (Object.keys(updates).length === 0) {
    return responseMessage(res, {
      status: 400,
      message: "Nothing to update",
      success: false,
      error: "No editable fields were provided",
    });
  }

  // Friendly check first; the catch below still handles the race where two
  // requests claim the same name at once.
  if (updates.username) {
    const taken = await userModel.exists({
      username: updates.username,
      _id: { $ne: userId },
    });

    if (taken) {
      return responseMessage(res, {
        status: 409,
        message: "That username is already taken",
        success: false,
        error: "Username already exists",
        data: { fields: [{ field: "username", message: "Already taken" }] },
      });
    }
  }

  try {
    const user = await userModel
      .findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    if (!user) {
      return responseMessage(res, {
        status: 404,
        message: "User not found",
        success: false,
        error: "User not found",
      });
    }

    return responseMessage(res, {
      status: 200,
      message: "Profile updated",
      success: true,
      data: publicUser(user),
    });
  } catch (error) {
    // The unique index is real, so a lost race surfaces as E11000 rather than
    // the pre-check above.
    if (error?.code === 11000) {
      return responseMessage(res, {
        status: 409,
        message: "That username is already taken",
        success: false,
        error: "Username already exists",
        data: { fields: [{ field: "username", message: "Already taken" }] },
      });
    }

    if (error?.name === "ValidationError") {
      return responseMessage(res, {
        status: 400,
        message: Object.values(error.errors)[0]?.message ?? "Invalid profile",
        success: false,
        error: "Validation failed",
      });
    }

    throw error;
  }
}

/**
 * PATCH /api/auth/password — change password.
 *
 * The current password is required and verified: a session cookie alone must
 * not be enough to lock the real owner out of their own account.
 *
 * Succeeding here evicts every OTHER session — see passwordChangedAt and the
 * matching check in authUser.
 */
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  const user = await userModel.findById(req.user.id).select("+password");

  if (!user) {
    return responseMessage(res, {
      status: 404,
      message: "User not found",
      success: false,
      error: "User not found",
    });
  }

  const matches = await user.comparePassword(currentPassword);

  if (!matches) {
    return responseMessage(res, {
      status: 401,
      message: "That's not your current password",
      success: false,
      error: "Incorrect password",
      data: {
        fields: [{ field: "currentPassword", message: "Incorrect password" }],
      },
    });
  }

  if (currentPassword === newPassword) {
    return responseMessage(res, {
      status: 400,
      message: "Your new password must be different from the current one",
      success: false,
      error: "Password unchanged",
      data: {
        fields: [{ field: "newPassword", message: "Choose a different password" }],
      },
    });
  }

  // Backdate by a second so the freshly-issued token below is never caught by
  // its own eviction check — JWT `iat` has one-second resolution, so a token
  // minted in the same second could otherwise look "issued before" the change.
  const changedAt = new Date(Date.now() - 1000);

  user.password = newPassword; // hashed by the model's pre("save") hook
  user.passwordChangedAt = changedAt;
  await user.save();

  const changedAtSeconds = Math.floor(changedAt.getTime() / 1000);

  try {
    await redis.set(
      passwordChangeKey(user._id.toString()),
      String(changedAtSeconds),
      "EX",
      TOKEN_TTL_SECONDS,
    );
  } catch (err) {
    // The password IS changed at this point; the cache write only drives the
    // eviction of other sessions. Report success but say so loudly in the log.
    console.error("Password-change eviction write failed:", err.message);
  }

  // Keep the device that made the change signed in with a token issued after
  // the cutoff. Every older token is now rejected.
  res.cookie("token", issueToken(user), COOKIE_OPTIONS);

  responseMessage(res, {
    status: 200,
    message: "Password updated. Other devices have been signed out.",
    success: true,
    data: publicUser(user),
  });
}

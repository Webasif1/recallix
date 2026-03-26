import userModel from "../models/user_model.js";
import { responseMessage } from "../utils/responseMessage.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken"

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

  const emailVerificationToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.JWT_SECRET,
  );

  await sendEmail({
    to: email,
    subject: "Welcome to Recallix",
    text: `Welcome ${username}`,
    html: `<h2>Welcome to Recallix</h2>
          <p>Hi ${username},</p>

          <p>
          Thanks for registering. Your account has been successfully created.
          </p>

          <p>
          Please verify your email address by clicking the link below: <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}"
           >
           Verify Email
          </a>
          </p>

          <hr/>
          <p>Recallix Team</p>`,
  });

  responseMessage(res, {
    status: 200,
    message: "User has been created successfully",
    data:{
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ $or: [{ username }, { email }] });
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

  if (!user.verified) {
    return responseMessage(res, {
      status: 400,
      message: "Please verify your email before login",
      success: false,
      error: "Email not verified",
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

  res.cookie("token", token);

  responseMessage(res, {
    status: 200,
    message: "Login successfully",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

export async function getMe(req, res) {
  const userId = req.user.id;

  const user = await userModel.findById(userId).select("-password");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: "User not Found",
    });
  }

  res.status(200).json({
    message: "User details fetched successfully",
    success: true,
    user,
  });
}

export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        err: "User not found",
      });
    }

    user.verified = true;
    await user.save();

    const html = `
  <h1>Email verified successfully</h1>
    <p>Your Email has been Verified. You can now login to your account</p>
    <a href= "https://localhost:3000/login">Go To Login</a>
  `;
    return res.send(html);
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expire token",
      success: false,
      err: err.message,
    });
  }
}

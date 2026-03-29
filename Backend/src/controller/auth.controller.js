import userModel from "../models/user_model.js";
import { responseMessage } from "../utils/responseMessage.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

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
    html: `
  <div style="background-color:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">

    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;background:#ffffff;border-radius:8px;padding:20px;">

      <tr>
        <td style="text-align:center;">
          <h2 style="color:#111;margin-bottom:10px;">Welcome to Recallix 🚀</h2>
        </td>
      </tr>

      <tr>
        <td>
          <p style="font-size:14px;color:#555;">Hi ${username},</p>

          <p style="font-size:14px;color:#555;">
            Thanks for registering. Your account has been successfully created.
          </p>

          <p style="font-size:14px;color:#555;">
            Please verify your email address by clicking the button below:
          </p>
        </td>
      </tr>

      <tr>
        <td style="text-align:center;padding:20px 0;">
          <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}"
            style="
              display:inline-block;
              padding:12px 24px;
              background-color:#FF7F11;
              color:#ffffff;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
            ">
            Verify Email
          </a>
        </td>
      </tr>

      <tr>
        <td>
          <p style="font-size:12px;color:#888;">
            If you did not create this account, you can safely ignore this email.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />

          <p style="font-size:12px;color:#999;text-align:center;">
            — Recallix Team
          </p>
        </td>
      </tr>

    </table>
  </div>
  `,
  });

  responseMessage(res, {
    status: 200,
    message: "User has been created successfully",
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
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
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

export async function getMe(req, res) {
  const userId = req.user.id;
  console.log(req.user.id)

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
    data:user,
  });
}

export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return responseMessage(res, {
        status: 400,
        message: "Invalid token",
        success: false,
        err: "User not found",
      });
    }

    user.verified = true;
    await user.save();

    const html = `
    <div style="
    font-family: 'Segoe UI', Arial, sans-serif;
    background-color: #f9fafb;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      text-align: center;
      max-width: 400px;
      width: 100%;
    ">

      <h1 style="
        color: #FF7F11;
        margin-bottom: 10px;
      ">
        Email Verified
      </h1>

      <p style="
        color: #555;
        font-size: 15px;
        margin-bottom: 25px;
      ">
        Your email has been successfully verified.
        You can now log in to your account.
      </p>

      <a
        href="http://localhost:3000/login"
        style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #FF7F11;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: 0.3s;
        "
      >
        Go to Login →
      </a>

    </div>
  </div>
  `;
    return res.send(html);
  } catch (err) {
    return responseMessage(res, {
      status: 400,
      message: "Invalid or expire token",
      success: false,
      err: err.message,
    });
  }
}

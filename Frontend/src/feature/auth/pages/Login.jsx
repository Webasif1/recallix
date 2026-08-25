import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import LoginComponent from "../components/LoginComponent";
import notify from "../../../shared/lib/notify";
import { getApiErrorMessage, getFieldErrors } from "../../../shared/lib/apiClient";

const Login = () => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
  };

  const validate = () => {
    const errors = {};

    if (!values.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
      errors.email = "Enter a valid email address";

    if (!values.password) errors.password = "Password is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const user = await handleLogin({
        email: values.email.trim(),
        password: values.password,
      });

      notify.success(`Welcome back, ${user?.username ?? "friend"}`, {
        id: "auth-login",
      });

      // Only navigates on success. This used to run unconditionally, so a
      // failed login still landed on the dashboard.
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err, "Login failed");

      setFormError(message);
      setFieldErrors(getFieldErrors(err));
      notify.error(message, { id: "auth-login" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LoginComponent
      values={values}
      setField={setField}
      fieldErrors={fieldErrors}
      formError={formError}
      submitting={submitting}
      handleSubmit={handleSubmit}
    />
  );
};

export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import RegisterComponents from "../components/RegisterComponents";
import notify from "../../../shared/lib/notify";
import { getApiErrorMessage, getFieldErrors } from "../../../shared/lib/apiClient";

const Register = () => {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
  };

  // Mirrors Backend/src/validator/auth.validator.js so the user sees the
  // problem before a round trip.
  const validate = () => {
    const errors = {};
    const username = values.username.trim();

    if (!username) errors.username = "Username is required";
    else if (username.length < 3 || username.length > 30)
      errors.username = "Use between 3 and 30 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
      errors.username = "Letters, numbers and underscores only";

    if (!values.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
      errors.email = "Enter a valid email address";

    if (!values.password) errors.password = "Password is required";
    else if (values.password.length < 6)
      errors.password = "At least 6 characters";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    setFormError(null);

    try {
      await handleRegister({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });

      notify.success("Your memory is ready", {
        description: "Save your first link to get started.",
        id: "auth-register",
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err, "Registration failed");

      setFormError(message);
      setFieldErrors(getFieldErrors(err));
      notify.error(message, { id: "auth-register" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RegisterComponents
      values={values}
      setField={setField}
      fieldErrors={fieldErrors}
      formError={formError}
      submitting={submitting}
      handleSubmit={handleSubmit}
    />
  );
};

export default Register;

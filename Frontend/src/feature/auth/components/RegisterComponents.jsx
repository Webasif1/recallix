import { Link } from "react-router-dom";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Input from "../../../shared/ui/Input";
import Button from "../../../shared/ui/Button";

const RegisterComponents = ({
  values,
  setField,
  fieldErrors = {},
  formError,
  submitting,
  handleSubmit,
}) => (
  <AuthLayout
    title="Start remembering"
    subtitle="Save a link once. Find it whenever you need it."
    footer={
      <>
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-accent font-medium hover:underline rounded"
        >
          Sign in
        </Link>
      </>
    }
  >
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-danger-soft border border-danger/20 rounded-control px-3.5 py-3"
        >
          <AlertCircle
            className="w-4 h-4 text-danger shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-small text-danger">{formError}</p>
        </div>
      )}

      <Input
        label="Username"
        name="username"
        icon={User}
        autoComplete="username"
        placeholder="yourname"
        value={values.username}
        onChange={(e) => setField("username", e.target.value)}
        error={fieldErrors.username}
        hint="Letters, numbers and underscores."
        disabled={submitting}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        icon={Mail}
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(e) => setField("email", e.target.value)}
        error={fieldErrors.email}
        disabled={submitting}
      />

      <Input
        label="Password"
        type="password"
        name="password"
        icon={Lock}
        autoComplete="new-password"
        placeholder="At least 6 characters"
        value={values.password}
        onChange={(e) => setField("password", e.target.value)}
        error={fieldErrors.password}
        disabled={submitting}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        className="w-full"
      >
        {submitting ? "Creating your memory…" : "Create account"}
      </Button>
    </form>
  </AuthLayout>
);

export default RegisterComponents;

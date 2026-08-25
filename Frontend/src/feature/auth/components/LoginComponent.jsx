import { Link } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Input from "../../../shared/ui/Input";
import Button from "../../../shared/ui/Button";

const LoginComponent = ({
  values,
  setField,
  fieldErrors = {},
  formError,
  submitting,
  handleSubmit,
}) => (
  <AuthLayout
    title="Welcome back"
    subtitle="Everything you saved is right where you left it."
    footer={
      <>
        New here?{" "}
        <Link
          to="/register"
          className="text-accent font-medium hover:underline rounded"
        >
          Create an account
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
        autoComplete="current-password"
        placeholder="Your password"
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
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  </AuthLayout>
);

export default LoginComponent;

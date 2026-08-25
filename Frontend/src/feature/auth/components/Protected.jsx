import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import RouteSplash from "./RouteSplash";
import ErrorState from "../../../shared/ui/ErrorState";
import { useAuth } from "../hook/useAuth";

/**
 * Gate for signed-in routes.
 *
 * `loading` starts true and only settles once the boot session probe has run,
 * so we must wait rather than redirect — otherwise a hard refresh bounces a
 * signed-in user out to /login.
 */
const Protected = ({ children }) => {
  const { user, loading, sessionUnreachable } = useSelector(
    (state) => state.auth,
  );
  const location = useLocation();
  const { handleGetMe } = useAuth();
  const [retrying, setRetrying] = useState(false);

  if (loading) return <RouteSplash />;

  // The server was unreachable, so we do not KNOW whether they are signed in.
  // Sending them to /login would claim they were signed out and hand them a
  // form that cannot work either.
  if (!user && sessionUnreachable) {
    const retry = async () => {
      setRetrying(true);
      try {
        await handleGetMe();
      } finally {
        setRetrying(false);
      }
    };

    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <ErrorState
            title="We couldn't reach Recallix"
            message={sessionUnreachable}
            reassurance="Everything you saved is safe — this is a connection problem, not a sign-out."
            onRetry={retry}
            retrying={retrying}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default Protected;

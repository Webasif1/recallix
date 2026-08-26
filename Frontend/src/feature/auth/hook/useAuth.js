import { useDispatch } from "react-redux";
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
} from "../service/auth.api";
import {
  setUser,
  setLoading,
  setError,
  setSessionUnreachable,
} from "../auth.slice";
import { getApiErrorMessage } from "../../../shared/lib/apiClient";

/**
 * Auth actions.
 *
 * Three rules these handlers must keep:
 *  1. On failure they RETHROW. They used to swallow the error and return
 *     undefined, so callers could not tell a failed login from a successful
 *     one and navigated to the dashboard either way.
 *  2. They store the user PAYLOAD (`response.data`), not the whole response
 *     envelope, so every component can read `user.username` directly.
 *  3. Only handleGetMe touches the global `auth.loading`. That flag means
 *     "the boot session probe is still running" and the route guards render a
 *     splash while it is true — so toggling it during a login submit
 *     UNMOUNTS the login form mid-request and throws away the typed values
 *     and the inline error. Forms track their own submitting state.
 */
export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ username, email, password }) {
    try {
      dispatch(setError(null));

      const response = await register({ username, email, password });
      dispatch(setUser(response.data));

      return response.data;
    } catch (err) {
      dispatch(setError(getApiErrorMessage(err, "Registration failed")));
      throw err;
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setError(null));

      const response = await login({ email, password });
      dispatch(setUser(response.data));

      return response.data;
    } catch (err) {
      dispatch(setError(getApiErrorMessage(err, "Login failed")));
      throw err;
    }
  }

  /**
   * Session probe on app start.
   *
   * A 401 is the NORMAL signed-out case — not an error worth surfacing.
   * Anything else means we could not reach the server, which must NOT be
   * treated as "signed out": that silently redirects an authenticated user to
   * the login page during an outage, where signing in fails too.
   */
  async function handleGetMe() {
    try {
      dispatch(setLoading(true));

      const response = await getMe();
      dispatch(setUser(response.data));
      dispatch(setSessionUnreachable(null));

      return response.data;
    } catch (err) {
      dispatch(setUser(null));

      if (err?.response?.status === 401) {
        dispatch(setSessionUnreachable(null));
      } else {
        dispatch(
          setSessionUnreachable(
            getApiErrorMessage(err, "We couldn't reach Recallix"),
          ),
        );
      }

      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
    try {
      await logout();

      return true;
    } catch (err) {
      dispatch(setError(getApiErrorMessage(err, "Logout failed")));
      throw err;
    } finally {
      // Clear locally either way: if the request failed the cookie may still
      // be gone, and leaving a stale user in the store is worse.
      dispatch(setUser(null));
    }
  }

  /**
   * Edit username / bio / avatar. Only send what changed — the endpoint is a
   * partial update, so an omitted field is left alone rather than cleared.
   */
  async function handleUpdateProfile(changes) {
    try {
      dispatch(setError(null));

      const response = await updateProfile(changes);
      // Refresh the store so the sidebar name and profile update immediately,
      // without a reload or a second round trip.
      dispatch(setUser(response.data));

      return response.data;
    } catch (err) {
      dispatch(setError(getApiErrorMessage(err, "Couldn't update profile")));
      throw err;
    }
  }

  async function handleChangePassword({ currentPassword, newPassword }) {
    try {
      dispatch(setError(null));

      const response = await changePassword({ currentPassword, newPassword });
      dispatch(setUser(response.data));

      return response.data;
    } catch (err) {
      dispatch(setError(getApiErrorMessage(err, "Couldn't change password")));
      throw err;
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
    handleUpdateProfile,
    handleChangePassword,
  };
}

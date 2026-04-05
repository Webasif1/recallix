import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ username, email, password }) {
    try {
      dispatch(setLoading(true));
      const data = await register({ username, email, password });
      dispatch(setUser(data));
      return data
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Registration failed"));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      const data = await login({ email, password });
      dispatch(setUser(data));
      return data
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Login failed"));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      dispatch(setUser(data));
      return data
    } catch (err) {
      dispatch(
        setError(err.response?.data?.message || "Failed to fetched user"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
    try {
      dispatch(setLoading(true));
      await logout();
      dispatch(setUser(null));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Logout failed"));
    } finally {
      dispatch(setLoading(false));
    }
  }


  return {
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout
  };
}

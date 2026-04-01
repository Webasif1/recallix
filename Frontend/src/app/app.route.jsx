import { createBrowserRouter } from "react-router-dom";
import Login from "../feature/auth/pages/Login";
import Register from "../feature/auth/pages/Register";
import Protected from "../feature/auth/components/Protected";
import Home from "../feature/item/pages/Home";
import { Navigate } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/",
    element: <Protected>
      <Home />
    </Protected>
  },
  {
    path: "/home",
    element: <Navigate to="/" replace />
  }
])

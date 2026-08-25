import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../feature/auth/pages/Login";
import Register from "../feature/auth/pages/Register";
import PublicRoute from "../feature/auth/components/PublicRoute";
import Protected from "../feature/auth/components/Protected";
import Home from "./Pages/Home";
import Dashboard from "../feature/item/pages/Dashboard";
import NotFound from "../feature/item/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <Home />
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    // Was rendering unguarded: a signed-out visitor reached the dashboard and
    // saw an empty shell plus a stream of 401s.
    path: "/dashboard",
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
  },
  {
    path: "/home",
    element: <Navigate to="/" replace />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

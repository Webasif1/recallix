import { createBrowserRouter } from "react-router-dom";
import Login from "../feature/auth/pages/Login";
import Register from "../feature/auth/pages/Register";
import Protected from "../feature/auth/components/Protected";

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
      <h1>Hello</h1>
    </Protected>
  }
])

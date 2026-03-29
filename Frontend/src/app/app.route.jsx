import { createBrowserRouter } from "react-router-dom";
import Login from "../feature/auth/pages/Login";
import Protected from "../feature/auth/components/Protected";

export const router = createBrowserRouter([
  {
    path:"/login",
    element: <Login/>
  },
  {
    path:"/",
    element: <Protected>
      <h1>Hello</h1>
    </Protected>
  }
])

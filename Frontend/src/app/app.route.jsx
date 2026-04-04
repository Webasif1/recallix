import { createBrowserRouter } from "react-router-dom";
import Login from "../feature/auth/pages/Login";
import Register from "../feature/auth/pages/Register";
import Protected from "../feature/auth/components/Protected";
import PublicRoute from "../feature/auth/components/PublicRoute";
import Home from "../feature/item/pages/Home";
import Dashboard from "../feature/item/pages/Dashboard"
import NoteFound from "../feature/item/pages/NotFound"
import { Navigate } from "react-router-dom";
import GraphView from "../feature/item/components/GraphView";

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
    element: <PublicRoute>
      <Home />
    </PublicRoute>

  },
  {
    path: "/home",
    element: <Navigate to="/" replace />
  },
  {
    path: "/dashboard",
    element: <Protected>
      <Dashboard />
    </Protected>
  },{
    path:"*",
    element: <NoteFound/>
  },
  {
    path:"/graph",
    element: <GraphView/>
  }
])

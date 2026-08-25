import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from "./app.route";
import { useAuth } from "../feature/auth/hook/useAuth";

/** sonner reads position once on mount, so track the breakpoint in state. */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = (e) => setIsMobile(e.matches);

    setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);

    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
};

const App = () => {
  const { handleGetMe } = useAuth();
  const isMobile = useIsMobile();

  // Probe the session cookie once on boot; route guards wait on auth.loading.
  useEffect(() => {
    handleGetMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <RouterProvider router={router} />

      {/*
        Every toast in the app renders here. This was missing entirely, which
        made every toast.success/error call in the codebase a silent no-op.
        On mobile the bottom-right slot collides with the save FAB, so toasts
        move to the top.
      */}
      <Toaster
        position={isMobile ? "top-center" : "bottom-right"}
        richColors
        closeButton
        expand={false}
        visibleToasts={3}
        duration={4000}
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontSize: "0.875rem",
          },
        }}
      />
    </>
  );
};

export default App;

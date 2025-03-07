import useAuth from "../hooks/useAuth";
import { Spinner } from "./spinner";
import { Navigate, Outlet } from "react-router";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  return isLoading ? (
    <div className="hero min-h-screen">
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md mx-auto">
          <Spinner />
        </div>
      </div>
    </div>
  ) : user ? (
    <Outlet />
  ) : (
    <Navigate
      to={"/login"}
      replace
      state={{
        redirectUri: window.location.pathname,
      }}
    />
  );
}

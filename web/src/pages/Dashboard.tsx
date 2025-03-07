import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../api/queries";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: logout,
  });

  return (
    <div>
      <div className="navbar bg-base-300 shadow-sm">
        <div className="navbar-start" />
        <div className="navbar-center" />
        <div className="navbar-end">
          <button
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              mutate();
              navigate("/login");
            }}
            className="btn btn-warning"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>

      <h1 className="text-center my-5 text-4xl font-extrabold">
        Hello, {user?.email}
      </h1>
    </div>
  );
}

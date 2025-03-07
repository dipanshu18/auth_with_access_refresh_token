import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { login } from "../api/mutations";

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const { isPending, isError, mutate } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate("/", { replace: true });
    },
  });

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login</h1>
        </div>

        <div className="card bg-base-100 w-full min-w-lg shrink-0 shadow-2xl">
          <div className="card-body">
            {isError && (
              <div className="my-2">
                <h1 className="text-lg text-red-500 font-semibold text-center">
                  Invalid email or password
                </h1>
              </div>
            )}

            <fieldset className="fieldset gap-3">
              <div>
                <label className="fieldset-label" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  className="input w-full"
                  placeholder="Email"
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  value={credentials.email}
                />
              </div>

              <div>
                <label className="fieldset-label" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="Password"
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  value={credentials.password}
                />
              </div>

              <div>
                {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
                <a className="link link-hover">Forgot password?</a>
              </div>

              <button
                disabled={
                  isPending ||
                  !credentials.email ||
                  credentials.password.length < 6
                }
                className="btn btn-warning"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  mutate(credentials);
                }}
              >
                {isPending ? "Submitting..." : "Login"}
              </button>
            </fieldset>
            <div className="mt-5 text-center">
              <p className="text-neutral-400">
                Don't have an account?{" "}
                <Link
                  to={"/signup"}
                  className="link link-hover text-white font-bold"
                >
                  Signup
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

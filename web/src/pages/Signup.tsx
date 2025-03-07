import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signup } from "../api/mutations";

export default function Signup() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { isError, isPending, mutate, error } = useMutation({
    mutationKey: ["signup"],
    mutationFn: signup,
    onSuccess: () => {
      navigate("/", { replace: true });
    },
  });

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Signup</h1>
        </div>
        <div className="card bg-base-100 w-full min-w-lg shrink-0 shadow-2xl">
          <div className="card-body">
            {isError && (
              <div className="my-2">
                <h1 className="text-lg text-red-500 font-medium">
                  {error.message ?? "Something went wrong"}
                </h1>
              </div>
            )}
            <fieldset className="fieldset gap-4">
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
                <label className="fieldset-label" htmlFor="confirm-password">
                  Confirm password
                </label>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="Confirm password"
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      confirmPassword: e.target.value,
                    })
                  }
                  value={credentials.confirmPassword}
                />
              </div>

              <button
                disabled={
                  isPending ||
                  !credentials.email ||
                  credentials.password.length < 6 ||
                  credentials.password !== credentials.confirmPassword
                }
                className="btn btn-warning"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  mutate(credentials);
                }}
              >
                Signup
              </button>
            </fieldset>

            <div className="mt-5 text-center">
              <p className="text-neutral-400">
                Already have an account?{" "}
                <Link
                  to={"/login"}
                  className="link link-hover text-white font-bold"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

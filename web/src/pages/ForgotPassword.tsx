import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { sendPasswordResetEmail } from "../api/queries";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const { isPending, isError, isSuccess, error, mutate } = useMutation({
    mutationKey: ["forgotPassword"],
    mutationFn: sendPasswordResetEmail,
  });

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Forgot password</h1>
        </div>

        <div className="card bg-base-100 w-full min-w-lg shrink-0 shadow-2xl">
          <div className="card-body">
            {isError && (
              <div className="my-2">
                <h1 className="text-lg text-red-500 font-semibold text-center">
                  {error.message ?? "An error occured"}
                </h1>
              </div>
            )}

            {isSuccess ? (
              <div className="space-y-5">
                <div
                  role="alert"
                  className={`alert ${
                    isSuccess ? "alert-warning" : "alert-info"
                  }`}
                >
                  <p className="text-xl text-center font-bold">
                    Email sent! Check your inbox for further instructions
                  </p>
                </div>
              </div>
            ) : (
              <fieldset className="fieldset gap-3">
                <div>
                  <label className="fieldset-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input w-full"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>

                <button
                  disabled={isPending || !email}
                  className="btn btn-warning"
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    mutate(email);
                  }}
                >
                  {isPending ? "Submitting..." : "Reset password"}
                </button>
              </fieldset>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

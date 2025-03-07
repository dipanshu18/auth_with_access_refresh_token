import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../api/queries";
import { useState } from "react";
import { Link } from "react-router";

export function ResetPasswordForm({ code }: { code: string }) {
  const [password, setPassword] = useState("");

  const { isPending, isError, isSuccess, error, mutate } = useMutation({
    mutationKey: ["resetPassword"],
    mutationFn: resetPassword,
  });

  return (
    <div>
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
            className={`alert ${isSuccess ? "alert-warning" : "alert-info"}`}
          >
            <p className="text-xl text-center font-bold">
              {isSuccess ? "Password updated successfully!" : "Invalid link"}
            </p>
          </div>
          {!isSuccess && <p>The link is either invalid or expired.</p>}
          {!isSuccess && (
            <Link to={"/password/forgot"} replace>
              Request a new password reset link
            </Link>
          )}
        </div>
      ) : (
        <fieldset className="fieldset gap-3">
          <div>
            <label className="fieldset-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              className="input w-full"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <button
            disabled={isPending || password.length < 6}
            className="btn btn-warning"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              mutate({ password, verificationCode: code });
            }}
          >
            {isPending ? "Submitting..." : "Reset password"}
          </button>
        </fieldset>
      )}

      <div className="flex gap-5 mt-5">
        <Link to={"/login"} replace className="link">
          Login
        </Link>
        <Link to={"/signup"} replace className="link">
          Signup
        </Link>
      </div>
    </div>
  );
}

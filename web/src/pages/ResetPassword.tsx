import { Link, useSearchParams } from "react-router";
import { ResetPasswordForm } from "../components/reset-password-form";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const exp = Number(searchParams.get("exp"));
  const now = Date.now();

  const linkIsValid = code && exp && exp > now;

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Reset password</h1>
        </div>

        <div className="card bg-base-100 w-full min-w-lg shrink-0 shadow-2xl">
          <div className="card-body">
            {linkIsValid ? (
              <ResetPasswordForm code={code} />
            ) : (
              <div className="space-y-5 text-center">
                <div role="alert" className="alert alert-info">
                  <p className="text-xl text-center font-bold">Invalid link</p>
                </div>
                <p>The link is either invalid or expired.</p>
                <Link to={"/password/forgot"} replace className="link">
                  Request a new password reset link
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

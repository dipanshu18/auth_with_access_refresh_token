import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { verifyEmail } from "../api/queries";
import { Spinner } from "../components/spinner";

export default function VerifyEmail() {
  const { code } = useParams();

  const { isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["verifyEmail", code],
    queryFn: async () => await verifyEmail(code as string),
  });

  if (isError) {
    return (
      <div className="hero min-h-screen">
        <div className="hero-content flex-col">
          <h1>{error.message}</h1>
          <Link to={"/password/reset"} replace className="link block">
            Get a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md mx-auto">
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="space-y-5">
              <div
                role="alert"
                className={`alert ${
                  isSuccess ? "alert-warning" : "alert-info"
                }`}
              >
                <p className="text-xl text-center font-bold">
                  {isSuccess ? "Email successfully verified" : "Invalid link"}
                </p>
              </div>

              <Link to={"/"} replace>
                Back to home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

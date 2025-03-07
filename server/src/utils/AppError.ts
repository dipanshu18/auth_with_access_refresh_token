import type { AppErrorCode } from "../constants/appErrorCode";
import type { HttpStatusCode } from "../constants/http";

class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public message: string,
    public errorCode?: AppErrorCode
  ) {
    super();
  }
}

export default AppError;

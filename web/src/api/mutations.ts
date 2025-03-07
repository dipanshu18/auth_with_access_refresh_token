import { API } from "../config/apiClient";

interface ILoginCreds {
  email: string;
  password: string;
}

interface IRegisterCreds {
  email: string;
  password: string;
  confirmPassword: string;
}

export async function login({ email, password }: ILoginCreds) {
  await API.post("/auth/login", {
    email,
    password,
  });
}

export async function signup({
  email,
  password,
  confirmPassword,
}: IRegisterCreds) {
  await API.post("/auth/register", {
    email,
    password,
    confirmPassword,
  });
}

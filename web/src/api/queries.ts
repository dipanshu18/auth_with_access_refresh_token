import { API } from "../config/apiClient";

export async function logout() {
  await API.get("/auth/logout");
}

export async function verifyEmail(code: string) {
  const response = await API.get(`/auth/email/verify/${code}`);

  if (response.status === 200) {
    return true;
  }
}

export async function sendPasswordResetEmail(email: string) {
  await API.post("/auth/password/forgot", { email });
}

export async function resetPassword({
  verificationCode,
  password,
}: {
  verificationCode: string;
  password: string;
}) {
  await API.post("/auth/password/reset", { verificationCode, password });
}

export async function getUser(): Promise<{
  id: string;
  email: string;
  verified: boolean;
}> {
  return await API.get("/user");
}

export async function getSessions() {
  return await API.get("/sessions");
}

export async function deleteSession(id: string) {
  await API.delete(`/sessions/${id}`);
}

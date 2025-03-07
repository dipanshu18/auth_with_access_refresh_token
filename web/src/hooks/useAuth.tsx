import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/queries";

export default function useAuth() {
  const { data: response, ...rest } = useQuery({
    queryKey: ["auth"],
    queryFn: getUser,
    // biome-ignore lint/style/useNumberNamespace: <explanation>
    staleTime: Infinity,
  });

  return {
    user: response,
    ...rest,
  };
}

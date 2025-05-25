import { useEffect } from "react";
import { useRouter } from "expo-router";  // or useNavigation if React Navigation
import { jwtDecode } from "jwt-decode";
import * as SecureStore from "expo-secure-store";

interface TokenPayload {
  exp: number;  // expiry timestamp
  // add more fields if needed
}

async function isAccessTokenValid(): Promise<boolean> {
  const token = await SecureStore.getItemAsync("access_token");
  if (!token) return false;

  try {
    const res = jwtDecode<TokenPayload>(token);
    if (res && typeof res.exp === "number") {
        return Date.now() < res.exp * 1000;
    }
    else return false;
  } catch {
    return false;
  }
}

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const valid = await isAccessTokenValid();
      if (!valid) {
        router.replace("/login"); // redirect to login page
      }
    }
    checkAuth();
  }, [router]);
}
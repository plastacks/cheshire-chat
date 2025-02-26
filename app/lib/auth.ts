import { createServerFn } from "@tanstack/start";
import { setCookie, getWebRequest } from "@tanstack/start/server";

export const login = createServerFn({
  method: "POST",
})
  .validator((d: { username: string; password: string }) => d)
  .handler(async (ctx) => {
    try {
      const request = getWebRequest();
      const apiResponse = await fetch(
        `${request?.headers.get("x-forwarded-proto") || "http"}://${
          request?.headers.get("host")?.split(":")[0]
        }:1865/auth/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: ctx.data.username,
            password: ctx.data.password,
          }),
        }
      );

      const result = await apiResponse.json();

      if (apiResponse.ok && result.access_token) {
        setCookie("catToken", result.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return { success: true };
      } else {
        return {
          success: false,
          error: result.detail || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Connection error with server",
      };
    }
  });

export const checkAuth = createServerFn({
  method: "GET",
}).handler(async () => {
  const request = getWebRequest();
  const hasCatToken = request?.headers.get("cookie")?.includes("catToken=");
  return { isAuthenticated: !!hasCatToken };
});

export const logout = createServerFn({
  method: "POST",
}).handler(async () => {
  setCookie("catToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return { success: true };
});

export const getAuthToken = createServerFn({
  method: "GET",
}).handler(async () => {
  const request = getWebRequest();
  const cookies = request?.headers.get("cookie");
  const tokenMatch = cookies?.match(/catToken=([^;]+)/);

  const token = tokenMatch ? tokenMatch[1] : null;

  return token;
});

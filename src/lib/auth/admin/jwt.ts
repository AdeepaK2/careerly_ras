import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ADMIN_ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.ADMIN_REFRESH_TOKEN_SECRET!;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("Admin JWT secrets are not defined in environment variables");
}

export type AdminTokenPayload = {
  id: string;
  username: string;
  role: "superadmin" | "admin";
  type: "admin";
};

export function generateAdminTokens(payload: {
  id: string;
  username: string;
  role: "superadmin" | "admin";
}) {
  const base: AdminTokenPayload = {
    id: payload.id,
    username: payload.username,
    role: payload.role,
    type: "admin",
  };

  const accessToken = jwt.sign(base, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(base, REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
}

export function verifyAdminAccessToken(token: string): AdminTokenPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AdminTokenPayload;
}

export function verifyAdminRefreshToken(token: string): AdminTokenPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as AdminTokenPayload;
}

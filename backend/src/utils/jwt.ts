import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  role: string;
}

export const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId,
      role,
    } as JwtPayload,
    secret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN ||
        "7d") as jwt.SignOptions["expiresIn"],
    },
  );
};

import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    rawJwt?: string,
    user?: DefaultSession["user"] & {
      id?: string;
    };
  }

  interface User {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    rawJwt?: string;
  }
}

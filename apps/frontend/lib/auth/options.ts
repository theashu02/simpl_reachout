// import type { NextAuthOptions } from "next-auth";
// // import GithubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";

// import { connectToDatabase } from "@/lib/db/mongoose";
// import { UserModel } from "@/lib/models/user";

// const getEnv = (key: string) => {
//   const value = process.env[key];
//   if (!value) {
//     throw new Error(`Missing environment variable: ${key}`);
//   }
//   return value;
// };

// export const authOptions: NextAuthOptions = {
//   secret: getEnv("NEXTAUTH_SECRET"),
//   session: {
//     strategy: "jwt",
//   },
//   debug: process.env.NODE_ENV === "development",
//   pages: {
//     signIn: "/",
//   },
//   providers: [
//     GoogleProvider({
//       clientId: getEnv("GOOGLE_CLIENT_ID"),
//       clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
//     }),
//     // GithubProvider({
//     //   clientId: getEnv("GITHUB_CLIENT_ID"),
//     //   clientSecret: getEnv("GITHUB_CLIENT_SECRET"),
//     // }),
//   ],
//   callbacks: {
//     async signIn({ user, account }) {
//       if (!user.email) {
//         return false;
//       }

//       try {
//         await connectToDatabase();

//         const existingUser = await UserModel.findOne({ email: user.email });

//         if (!existingUser) {
//           await UserModel.create({
//             name: user.name,
//             email: user.email,
//             image: user.image,
//             provider: account?.provider,
//             providerAccountId: account?.providerAccountId,
//             lastLoginAt: new Date(),
//           });
//         } else {
//           existingUser.name = user.name ?? existingUser.name;
//           existingUser.image = user.image ?? existingUser.image;
//           existingUser.provider = account?.provider ?? existingUser.provider;
//           existingUser.providerAccountId =
//             account?.providerAccountId ?? existingUser.providerAccountId;
//           existingUser.lastLoginAt = new Date();
//           await existingUser.save();
//         }

//         return true;
//       } catch (error) {
//         console.error("Failed to sync user information with MongoDB", error);
//         return false;
//       }
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         const maybeId =
//           (user as { id?: string }).id ??
//           (user as { _id?: { toString: () => string } })._id?.toString();
//         if (maybeId) {
//           token.id = maybeId;
//         }
//       }

//       if (!token.id && token.email) {
//         await connectToDatabase();
//         const dbUser = await UserModel.findOne({ email: token.email });
//         if (dbUser) {
//           token.id = dbUser._id.toString();
//           token.name = dbUser.name;
//           token.picture = dbUser.image;
//         }
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string | undefined;
//         session.user.name = token.name ?? session.user.name;
//         session.user.image = token.picture ?? session.user.image;
//       }

//       return session;
//     },
//   },
// };


import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { encode } from "next-auth/jwt";

import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/user";
import { NEXTAUTH_SECRET } from "../constants";

const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export const authOptions: NextAuthOptions = {
  secret: getEnv("NEXTAUTH_SECRET"),
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",

  pages: {
    signIn: "/",
  },

  providers: [
    GoogleProvider({
      clientId: getEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        await connectToDatabase();
        const existing = await UserModel.findOne({ email: user.email });

        if (!existing) {
          await UserModel.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
            lastLoginAt: new Date(),
          });
        } else {
          existing.name = user.name ?? existing.name;
          existing.image = user.image ?? existing.image;
          existing.provider = account?.provider ?? existing.provider;
          existing.providerAccountId =
            account?.providerAccountId ?? existing.providerAccountId;
          existing.lastLoginAt = new Date();
          await existing.save();
        }

        return true;
      } catch (err) {
        console.error("Failed to sync user with DB", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        const maybeId =
          (user as { id?: string }).id ??
          (user as { _id?: { toString: () => string } })._id?.toString();
        if (maybeId) token.id = maybeId;
      }

      if (!token.id && token.email) {
        await connectToDatabase();
        const dbUser = await UserModel.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      // ⭐ Add raw signed JWT to token
      token.rawJwt = await encode({
        token,
        secret: NEXTAUTH_SECRET,
      });

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name ?? session.user.name;
        session.user.image = token.picture ?? session.user.image;
      }

      // ⭐ Pass raw JWT to the session for server actions
      session.rawJwt = token.rawJwt as string;

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
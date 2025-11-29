import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/user";
import { verifyMessage } from "ethers";

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
    CredentialsProvider({
      name: "MetaMask",
      credentials: {
        address: { label: "Address", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature) return null;

        try {
          const message = `Sign in to Simplx with address: ${credentials.address}`;
          const recoveredAddress = verifyMessage(message, credentials.signature);

          if (recoveredAddress.toLowerCase() !== credentials.address.toLowerCase()) {
            return null;
          }

          await connectToDatabase();

          // Generate the deterministic email we expect for this wallet
          const walletEmail = `${credentials.address.toLowerCase()}@wallet.simplx`;

          // FIXED: Search by walletAddress OR the generated email
          // This handles cases where the user exists but the walletAddress wasn't saved previously
          let user = await UserModel.findOne({
            $or: [
              { walletAddress: credentials.address.toLowerCase() },
              { email: walletEmail }
            ]
          });

          if (!user) {
            user = await UserModel.create({
              walletAddress: credentials.address.toLowerCase(),
              name: `Wallet ${credentials.address.slice(0, 6)}...`,
              email: walletEmail,
              image: `https://api.dicebear.com/7.x/identicon/svg?seed=${credentials.address}`,
              provider: "metamask",
              lastLoginAt: new Date(),
            });
          } else {
            // Update existing user: ensure walletAddress is saved if it was missing
            if (!user.walletAddress) {
              user.walletAddress = credentials.address.toLowerCase();
            }
            user.lastLoginAt = new Date();
            await user.save();
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (e) {
          console.error("MetaMask Auth Error", e);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Allow credentials provider to pass through standard checks
      if (account?.provider === "credentials") return true;
      
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
          token.name = dbUser.name ?? token.name;
          token.picture = dbUser.image ?? token.picture;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name ?? session.user.name;
        session.user.image = token.picture ?? session.user.image;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// import type { NextAuthOptions } from "next-auth";
// import GithubProvider from "next-auth/providers/github";
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


// import NextAuth, { type NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { encode } from "next-auth/jwt";

// import { connectToDatabase } from "@/lib/db/mongoose";
// import { UserModel } from "@/lib/models/user";
// import { NEXTAUTH_SECRET } from "../constants";

// const getEnv = (key: string) => {
//   const value = process.env[key];
//   if (!value) throw new Error(`Missing environment variable: ${key}`);
//   return value;
// };

// export const authOptions: NextAuthOptions = {
//   secret: getEnv("NEXTAUTH_SECRET"),
//   session: { strategy: "jwt" },
//   debug: process.env.NODE_ENV === "development",

//   pages: {
//     signIn: "/",
//   },

//   providers: [
//     GoogleProvider({
//       clientId: getEnv("GOOGLE_CLIENT_ID"),
//       clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
//     }),
//   ],

//   callbacks: {
//     async signIn({ user, account }) {
//       if (!user.email) return false;

//       try {
//         await connectToDatabase();
//         const existing = await UserModel.findOne({ email: user.email });

//         if (!existing) {
//           await UserModel.create({
//             name: user.name,
//             email: user.email,
//             image: user.image,
//             provider: account?.provider,
//             providerAccountId: account?.providerAccountId,
//             lastLoginAt: new Date(),
//           });
//         } else {
//           existing.name = user.name ?? existing.name;
//           existing.image = user.image ?? existing.image;
//           existing.provider = account?.provider ?? existing.provider;
//           existing.providerAccountId =
//             account?.providerAccountId ?? existing.providerAccountId;
//           existing.lastLoginAt = new Date();
//           await existing.save();
//         }

//         return true;
//       } catch (err) {
//         console.error("Failed to sync user with DB", err);
//         return false;
//       }
//     },

//     async jwt({ token, user }) {
//       if (user) {
//         const maybeId =
//           (user as { id?: string }).id ??
//           (user as { _id?: { toString: () => string } })._id?.toString();
//         if (maybeId) token.id = maybeId;
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

//       // ⭐ Add raw signed JWT to token
//       token.rawJwt = await encode({
//         token,
//         secret: NEXTAUTH_SECRET,
//       });

//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.name = token.name ?? session.user.name;
//         session.user.image = token.picture ?? session.user.image;
//       }

//       // ⭐ Pass raw JWT to the session for server actions
//       session.rawJwt = token.rawJwt as string;

//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };


// import NextAuth, { type NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { connectToDatabase } from "@/lib/db/mongoose";
// import { UserModel } from "@/lib/models/user";

// const getEnv = (key: string) => {
//   const value = process.env[key];
//   if (!value) throw new Error(`Missing environment variable: ${key}`);
//   return value;
// };

// export const authOptions: NextAuthOptions = {
//   secret: getEnv("NEXTAUTH_SECRET"),
//   session: { strategy: "jwt" },
//   debug: process.env.NODE_ENV === "development",

//   pages: {
//     signIn: "/",
//   },

//   providers: [
//     GoogleProvider({
//       clientId: getEnv("GOOGLE_CLIENT_ID"),
//       clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
//     }),
//   ],

//   callbacks: {
//     async signIn({ user, account }) {
//       if (!user.email) return false;

//       try {
//         await connectToDatabase();
//         const existing = await UserModel.findOne({ email: user.email });

//         if (!existing) {
//           await UserModel.create({
//             name: user.name,
//             email: user.email,
//             image: user.image,
//             provider: account?.provider,
//             providerAccountId: account?.providerAccountId,
//             lastLoginAt: new Date(),
//           });
//         } else {
//           existing.name = user.name ?? existing.name;
//           existing.image = user.image ?? existing.image;
//           existing.provider = account?.provider ?? existing.provider;
//           existing.providerAccountId =
//             account?.providerAccountId ?? existing.providerAccountId;
//           existing.lastLoginAt = new Date();
//           await existing.save();
//         }

//         return true;
//       } catch (err) {
//         console.error("Failed to sync user with DB", err);
//         return false;
//       }
//     },

//     async jwt({ token, user }) {
//       if (user) {
//         const maybeId =
//           (user as { id?: string }).id ??
//           (user as { _id?: { toString: () => string } })._id?.toString();
//         if (maybeId) token.id = maybeId;
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
//         session.user.id = token.id as string;
//         session.user.name = token.name ?? session.user.name;
//         session.user.image = token.picture ?? session.user.image;
//       }

//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
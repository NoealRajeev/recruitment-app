// lib/auth/options.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { getServerSession, type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { refreshSession } from "./session";
import prisma from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (user.status !== "VERIFIED") {
          throw new Error("Account not verified");
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Update lastLogin and isFirstLogin
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          resetRequired: user.resetRequired,
          image: user.profilePicture || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Handle session updates from client
      if (trigger === "update") {
        return { ...token, ...session };
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.status = user.status;
        token.resetRequired = user.resetRequired;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
          status: token.status,
          resetRequired: token.resetRequired,
        };
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      await refreshSession(user.id);
    },
    async updateUser({ user }) {
      await refreshSession(user.id);
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

export async function getCurrentAuth(req, res) {
  return await getServerSession(req, res, authOptions);
}

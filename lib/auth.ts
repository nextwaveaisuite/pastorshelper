import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query, queryOne } from "./db";

const ADMIN_EMAIL = "chnomg@gmail.com";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSignUp: { label: "Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;
        const isSignUp = credentials.isSignUp === "true";

        const existing = await queryOne<Record<string, unknown>>(
          "SELECT * FROM users WHERE email = $1", [email]
        );

        if (isSignUp) {
          if (existing) throw new Error("EMAIL_EXISTS");
          const hash = await bcrypt.hash(password, 12);
          const rows = await query<Record<string, unknown>>(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const newUser = rows[0];
          await query(
            "INSERT INTO user_credits (user_id, balance, is_free_tier) VALUES ($1, 10, true) ON CONFLICT (user_id) DO NOTHING",
            [newUser.id]
          );
          await query(
            "INSERT INTO credit_transactions (user_id, type, amount, description) VALUES ($1, 'free_topup', 10, 'Welcome credits')",
            [newUser.id]
          );
          return { id: newUser.id as string, email: newUser.email as string, isAdmin: email === ADMIN_EMAIL };
        } else {
          if (!existing) throw new Error("NO_ACCOUNT");
          if (!existing.password_hash) throw new Error("NO_PASSWORD");
          const valid = await bcrypt.compare(password, existing.password_hash as string);
          if (!valid) throw new Error("WRONG_PASSWORD");
          return { id: existing.id as string, email: existing.email as string, isAdmin: email === ADMIN_EMAIL };
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; name?: string | null; image?: string | null; isAdmin?: boolean };
  }
}
declare module "next-auth/jwt" {
  interface JWT { id?: string; isAdmin?: boolean; }
}

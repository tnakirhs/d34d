// /home/n3v3r/odoo/expense-manager/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const runtime = "nodejs"; // Prisma needs Node.js runtime

// Prevent creating multiple Prisma clients in dev
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export const authOptions = {
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        password: true,
                        role: true,
                        status: true,
                    },
                });

                if (!user) return null;
                if (user.status !== "ACTIVE") return null;

                // Supports both hashed (bcrypt) and plain passwords (for dev only)
                const passwordOk = user.password?.startsWith("$2")
                    ? await bcrypt.compare(credentials.password, user.password)
                    : credentials.password === user.password;

                if (!passwordOk) return null;

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (!user) return false;

            // Redirect to role-specific page after successful credentials sign-in
            if (account?.provider === "credentials") {
                const roleRedirects = {
                    ADMIN: "/admin",
                    MANAGER: "/manager",
                    EMPLOYEE: "/dashboard",
                };
                return roleRedirects[user.role] || "/";
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.status = user.status;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.status = token.status;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

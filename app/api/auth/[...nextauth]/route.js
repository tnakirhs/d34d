import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 🔹 Simulated user database
        const users = [
          { id: "1", name: "Admin User", email: "admin@example.com", password: "admin", role: "ADMIN" },
          { id: "2", name: "Manager User", email: "manager@example.com", password: "manager", role: "MANAGER" },
          { id: "3", name: "Employee User", email: "employee@example.com", password: "employee", role: "EMPLOYEE" },
        ];

        const user = users.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        return user || null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

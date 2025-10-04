import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    // `withAuth` augments your `Request` with the user's token.
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        // Role-based access control redirects
        if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/employee/dashboard", req.url));
        }

        if (pathname.startsWith("/manager") && token.role !== "MANAGER" && token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/employee/dashboard", req.url));
        }

        // For /employee path, the authorized callback already ensures the user is logged in.
        // No specific role redirect is needed here if ADMIN and MANAGER can also access it.

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                // If there's no token, the user is not logged in, and access is denied.
                if (!token) {
                    return false;
                }

                const { pathname } = req.nextUrl;

                // Check if the user has the required role for the path.
                if (pathname.startsWith("/admin")) {
                    return token.role === "ADMIN";
                }
                if (pathname.startsWith("/manager")) {
                    return token.role === "MANAGER" || token.role === "ADMIN";
                }
                // For /employee, any authenticated user is authorized.
                if (pathname.startsWith("/employee")) {
                    return !!token; // or check for any of the roles: "EMPLOYEE", "MANAGER", "ADMIN"
                }

                // Default to authorized if the path is not matched by the above conditions.
                return true;
            },
        },
        // If `authorized` returns false, user is redirected to the login page.
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/manager/:path*", "/employee/:path*"], // protected routes
};

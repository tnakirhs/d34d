import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, password, currency } = body;

        if (!name ||!email || !password || !currency) {
            return new Response(JSON.stringify({ error: "All fields are required" }), {
                status: 400,
            });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return new Response(JSON.stringify({ error: "User already exists" }), {
                status: 400,
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with ADMIN role and ACTIVE status by default
        // Use the email prefix as the default name

        const userCount = await prisma.user.count();
        const role = userCount === 0 ? "ADMIN" : "EMPLOYEE";

        await prisma.user.create({
            data: {
            name,
            email,
            password: hashedPassword,
            currency,
            role,
            status: "ACTIVE",
            },
        });

        if (role !== "ADMIN") {
            return new Response(
            JSON.stringify({ message: "Employee user registered successfully." }),
            { status: 201 }
            );
        }
        return new Response(JSON.stringify({ message: "Admin user registered successfully." }), {
            status: 201,
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500 });
    }
}

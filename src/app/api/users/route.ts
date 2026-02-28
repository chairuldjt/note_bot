import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
    const session = await getSession();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [rows] = await pool.query("SELECT id, username, status, role, createdAt FROM users ORDER BY createdAt DESC");
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, username, password, status, role } = await req.json();

        if (id) {
            // Update existing user
            await pool.query("UPDATE users SET status = ?, role = ? WHERE id = ?", [status, role, id]);
        } else {
            // Create new user
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                "INSERT INTO users (username, password, status, role) VALUES (?, ?, ?, ?)",
                [username, hashedPassword, status, role]
            );
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getSession();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        await pool.query("DELETE FROM users WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

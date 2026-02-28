import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const [rows] = await pool.query("SELECT * FROM bot_commands ORDER BY createdAt DESC");
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, command, response } = await req.json();
        if (id) {
            await pool.query("UPDATE bot_commands SET command = ?, response = ? WHERE id = ?", [command, response, id]);
        } else {
            await pool.query("INSERT INTO bot_commands (command, response) VALUES (?, ?)", [command, response]);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        if ((error as any).code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: "Command already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await req.json();
        await pool.query("DELETE FROM bot_commands WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

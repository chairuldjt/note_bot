import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const [rows] = await pool.query("SELECT * FROM kas ORDER BY tanggal DESC");
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, nama, jumlah } = await req.json();
        if (id) {
            await pool.query("UPDATE kas SET nama = ?, jumlah = ? WHERE id = ?", [nama, jumlah, id]);
        } else {
            await pool.query("INSERT INTO kas (nama, jumlah) VALUES (?, ?)", [nama, jumlah]);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await req.json();
        await pool.query("DELETE FROM kas WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

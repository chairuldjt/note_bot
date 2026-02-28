import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { waManager } from "@/lib/wa";
import QRCode from "qrcode";

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let qrImage = null;
    if (waManager.qr) {
        qrImage = await QRCode.toDataURL(waManager.qr);
    }

    return NextResponse.json({
        status: waManager.status,
        hasQr: !!waManager.qr,
        qr: qrImage
    });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = await req.json();

    try {
        if (action === "reconnect") {
            waManager.sock = null;
            await waManager.init();
        } else if (action === "logout") {
            await waManager.logout();
            await waManager.init();
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Bot action failed" }, { status: 500 });
    }
}

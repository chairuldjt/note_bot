import makeWASocket, {
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    ConnectionState,
    downloadContentFromMessage,
    proto
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { useMySQLAuthState } from "./wa-auth";
import pool from "./db";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import * as path from "path";
import { tmpdir } from "os";

class WhatsAppManager {
    public sock: any = null;
    public status: "CONNECTED" | "CONNECTING" | "DISCONNECTED" = "DISCONNECTED";
    public qr: string | null = null;
    private logger = pino({ level: "silent" });
    private isInitializing = false;

    async init() {
        if (this.sock || this.isInitializing) return;
        this.isInitializing = true;

        try {
            console.log("Initializing WhatsApp Bot...");
            const { state, saveCreds } = await useMySQLAuthState("main-session");
            const { version } = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                version,
                printQRInTerminal: false,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, this.logger),
                },
                logger: this.logger,
                browser: ["NoteBot Admin", "Chrome", "1.0.0"],
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 0,
            });

            this.sock.ev.on("connection.update", (update: Partial<ConnectionState>) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qr = qr;
                }

                if (connection === "close") {
                    this.qr = null;
                    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 401 && statusCode !== 409;

                    console.log(`Connection closed [${statusCode}]. Reconnecting: ${shouldReconnect}`);

                    this.status = "DISCONNECTED";
                    this.sock = null;

                    if (shouldReconnect) {
                        setTimeout(() => this.init(), 5000);
                    }
                } else if (connection === "open") {
                    console.log("WhatsApp Connection Opened!");
                    this.status = "CONNECTED";
                    this.qr = null;
                } else if (connection === "connecting") {
                    this.status = "CONNECTING";
                }
            });

            this.sock.ev.on("creds.update", saveCreds);

            this.sock.ev.on("messages.upsert", async ({ messages, type }: any) => {
                if (type !== "notify") return;

                for (const msg of messages) {
                    if (!msg.message || msg.key.fromMe) continue;

                    const jid = msg.key.remoteJid;
                    const text = msg.message.conversation ||
                        msg.message.extendedTextMessage?.text ||
                        msg.message.imageMessage?.caption || "";

                    if (text.startsWith("/")) {
                        await this.handleCommand(jid, text.trim(), msg);
                    }
                }
            });
        } catch (error) {
            console.error("Bot initialization error:", error);
            this.sock = null;
        } finally {
            this.isInitializing = false;
        }
    }

    private async handleCommand(jid: string, text: string, msg: any) {
        const parts = text.split(" ");
        const command = parts[0].toLowerCase();
        const sender = msg.key.participant || msg.key.remoteJid;

        try {
            // 1. Sticker Maker
            if (command === "/sticker") {
                await this.handleSticker(jid, msg);
                return;
            }

            // 2. Kas Management
            if (command === "/tambahkas") {
                if (parts.length < 3) return this.reply(jid, "❌ Format: /tambahkas <nama> <jumlah>");
                const nama = parts[1];
                const jumlah = parseFloat(parts[2]);
                if (isNaN(jumlah)) return this.reply(jid, "❌ Jumlah harus angka");
                await pool.query("INSERT INTO kas (nomor, nama, jumlah) VALUES (?, ?, ?)", [sender, nama, jumlah]);
                return this.reply(jid, "✅ Kas berhasil ditambahkan!");
            }

            if (command === "/kurangikas") {
                if (parts.length < 3) return this.reply(jid, "❌ Format: /kurangikas <keperluan> <jumlah>");
                const nama = parts[1];
                const jumlah = parseFloat(parts[2]);
                if (isNaN(jumlah)) return this.reply(jid, "❌ Jumlah harus angka");
                await pool.query("INSERT INTO kas (nomor, nama, jumlah) VALUES (?, ?, ?)", [sender, nama, -jumlah]);
                return this.reply(jid, "✅ Pengeluaran kas berhasil dicatat!");
            }

            if (command === "/hapus_kas") {
                if (parts.length < 2) return this.reply(jid, "❌ Format: /hapus_kas <id>");
                const id = parseInt(parts[1]);
                await pool.query("DELETE FROM kas WHERE id = ?", [id]);
                return this.reply(jid, `🗑️ Data kas ID #${id} telah dihapus.`);
            }

            if (command === "/cekkas") {
                await this.handleCekKas(jid);
                return;
            }

            if (command === "/historykas") {
                const [rows]: any = await pool.query("SELECT * FROM kas ORDER BY tanggal DESC LIMIT 15");
                let response = "💰 *HISTORY KAS (Last 15)*\n\n";
                rows.forEach((r: any) => {
                    response += `#${r.id} ${r.nama} - Rp ${r.jumlah.toLocaleString('id-ID')} (${new Date(r.tanggal).toLocaleDateString('id-ID')})\n`;
                });
                return this.reply(jid, response);
            }

            if (command === "/rekapbulan") {
                if (parts.length < 2) return this.reply(jid, "❌ Format: /rekapbulan <MM-YYYY>");
                await this.handleRekapBulan(jid, parts[1]);
                return;
            }

            // 3. Dynamic Commands from DB
            const [dbRows]: any = await pool.query("SELECT response FROM bot_commands WHERE command = ?", [text]);
            if (dbRows.length > 0) {
                await this.reply(jid, dbRows[0].response);
            }
        } catch (error) {
            console.error("Error handling command:", error);
            this.reply(jid, "❌ Terjadi kesalahan saat memproses perintah.");
        }
    }

    private async handleSticker(jid: string, msg: any) {
        const imageMsg = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        if (!imageMsg) return this.reply(jid, "❌ Silakan reply gambar atau kirim gambar dengan caption /sticker");

        try {
            const stream = await downloadContentFromMessage(imageMsg, "image");
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

            const inputPath = path.join(tmpdir(), `sticker_in_${Date.now()}.jpg`);
            const outputPath = path.join(tmpdir(), `sticker_out_${Date.now()}.webp`);

            fs.writeFileSync(inputPath, buffer);

            ffmpeg(inputPath)
                .complexFilter(['scale=512:512:force_original_aspect_ratio=increase,fps=15,crop=512:512'])
                .on('end', async () => {
                    await this.sock.sendMessage(jid, { sticker: fs.readFileSync(outputPath) }, { quoted: msg });
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                })
                .on('error', (e) => {
                    console.error(e);
                    this.reply(jid, "❌ Gagal konversi stiker.");
                })
                .save(outputPath);
        } catch (e) {
            console.error(e);
            this.reply(jid, "❌ Gagal memproses gambar.");
        }
    }

    private async handleCekKas(jid: string) {
        const now = new Date();
        const bulan = (now.getMonth() + 1).toString().padStart(2, '0');
        const tahun = now.getFullYear();
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        const [monthRows]: any = await pool.query(
            "SELECT DISTINCT nama FROM kas WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ? AND jumlah > 0",
            [bulan, tahun]
        );
        const [totalSaldo]: any = await pool.query("SELECT SUM(jumlah) as total FROM kas");

        let list = "";
        monthRows.forEach((r: any, i: number) => {
            list += `${i + 1}. ${r.nama} ✅\n`;
        });

        const response = `💰 *TOTAL KAS TERKUMPUL*\n\nList Kas ${monthNames[now.getMonth()]} ${tahun}:\n${list || "- Belum ada data -\n"}\nTotal Saldo: *Rp ${(totalSaldo[0]?.total || 0).toLocaleString('id-ID')}*`;
        await this.reply(jid, response);
    }

    private async handleRekapBulan(jid: string, period: string) {
        const [m, y] = period.split("-");
        const [rows]: any = await pool.query(
            "SELECT nama, SUM(jumlah) as total FROM kas WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ? GROUP BY nama",
            [m, y]
        );
        const [grandTotal]: any = await pool.query(
            "SELECT SUM(jumlah) as total FROM kas WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?",
            [m, y]
        );

        let list = `📆 *REKAP KAS ${period}*\n\n`;
        rows.forEach((r: any) => {
            list += `${r.nama}: Rp ${r.total.toLocaleString('id-ID')}\n`;
        });
        list += `\n*Total Bulan Ini: Rp ${(grandTotal[0]?.total || 0).toLocaleString('id-ID')}*`;
        await this.reply(jid, list);
    }

    private async reply(jid: string, text: string) {
        if (this.sock) {
            await this.sock.sendMessage(jid, { text });
        }
    }

    async logout() {
        if (this.sock) {
            try { await this.sock.logout(); } catch (e) { }
            this.sock = null;
            this.status = "DISCONNECTED";
            this.qr = null;
            await pool.query("DELETE FROM bot_sessions WHERE id LIKE 'main-session-%'");
        }
    }
}

const globalForWA = global as unknown as { waManager: WhatsAppManager };
export const waManager = globalForWA.waManager || new WhatsAppManager();
if (process.env.NODE_ENV !== "production") globalForWA.waManager = waManager;

if (typeof window === "undefined") {
    waManager.init();
}

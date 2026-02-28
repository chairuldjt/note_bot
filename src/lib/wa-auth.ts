import { AuthenticationState, AuthenticationCreds, BufferJSON, initAuthCreds, proto } from "@whiskeysockets/baileys";
import pool from "./db";

export async function useMySQLAuthState(sessionId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> {
    const writeData = async (data: any, id: string) => {
        const json = JSON.stringify(data, BufferJSON.replacer);
        await pool.query(
            "INSERT INTO bot_sessions (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)",
            [`${sessionId}-${id}`, json]
        );
    };

    const readData = async (id: string) => {
        try {
            const [rows]: any = await pool.query("SELECT data FROM bot_sessions WHERE id = ?", [`${sessionId}-${id}`]);
            if (rows.length > 0) {
                return JSON.parse(rows[0].data, BufferJSON.reviver);
            }
        } catch (error) {
            return null;
        }
        return null;
    };

    const removeData = async (id: string) => {
        await pool.query("DELETE FROM bot_sessions WHERE id = ?", [`${sessionId}-${id}`]);
    };

    const creds: AuthenticationCreds = (await readData("creds")) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data: { [id: string]: any } = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === "app-state-sync-key" && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data: any) => {
                    const tasks: Promise<void>[] = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const sId = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, sId));
                            } else {
                                tasks.push(removeData(sId));
                            }
                        }
                    }
                    await Promise.all(tasks);
                },
            },
        },
        saveCreds: () => writeData(creds, "creds"),
    };
}

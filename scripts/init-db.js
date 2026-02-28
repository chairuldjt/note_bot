const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Basic env loading
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    }
});

async function main() {
    const host = env.DB_HOST || 'localhost';
    const user = env.DB_USER || 'root';
    const password = env.DB_PASSWORD || '';
    const database = env.DB_NAME || 'note_bot_db';

    console.log('--- DATABASE INITIALIZATION ---');

    let connection;
    try {
        console.log(`1. Connecting to MySQL at ${host}...`);
        connection = await mysql.createConnection({ host, user, password });

        console.log(`2. Ensuring database "${database}" exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await connection.query(`USE \`${database}\``);

        console.log('3. Resetting tables...');
        const tables = [
            'bot_sessions',
            'bot_commands',
            'kas',
            'users'
        ];
        for (const table of tables) {
            await connection.query(`DROP TABLE IF EXISTS ${table}`);
        }

        console.log('4. Creating tables...');
        await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        role ENUM('USER', 'ADMIN') DEFAULT 'USER',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        await connection.query(`
      CREATE TABLE kas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nomor VARCHAR(255) DEFAULT 'web',
        nama VARCHAR(255) NOT NULL,
        jumlah DOUBLE NOT NULL,
        tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await connection.query(`
      CREATE TABLE bot_commands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        command VARCHAR(255) UNIQUE NOT NULL,
        response TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        await connection.query(`
      CREATE TABLE bot_sessions (
        id VARCHAR(255) PRIMARY KEY,
        data LONGTEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        console.log('5. Importing legacy data from SQL file...');
        const sqlFile = path.join(__dirname, '../kas_grup (2).sql');
        if (fs.existsSync(sqlFile)) {
            const content = fs.readFileSync(sqlFile, 'utf8');
            const lines = content.split('\n');

            function parseSqlValues(line) {
                const values = [];
                let current = "";
                let inQuote = false;
                let escaped = false;

                // Strip the surrounding parentheses and optional trailing comma/semicolon
                const content = line.trim().replace(/^\(/, '').replace(/\),?$/, '').replace(/\);?$/, '');

                for (let i = 0; i < content.length; i++) {
                    const char = content[i];
                    if (escaped) {
                        current += char;
                        escaped = false;
                    } else if (char === '\\') {
                        escaped = true;
                        current += char;
                    } else if (char === "'" && !inQuote) {
                        inQuote = true;
                    } else if (char === "'" && inQuote) {
                        if (content[i + 1] === "'") { // Escaped quote ''
                            current += "'";
                            i++;
                        } else {
                            inQuote = false;
                        }
                    } else if (char === "," && !inQuote) {
                        values.push(current.trim());
                        current = "";
                    } else {
                        current += char;
                    }
                }
                values.push(current.trim());
                return values.map(v => v.replace(/^'/, '').replace(/'$/, '').replace(/\\'/g, "'").replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n'));
            }

            let currentTable = '';
            for (let line of lines) {
                line = line.trim();
                if (line.startsWith('INSERT INTO `bot_commands`')) currentTable = 'bot_commands';
                else if (line.startsWith('INSERT INTO `kas`')) currentTable = 'kas';
                else if (line.startsWith('INSERT INTO `users`')) currentTable = 'users';

                if (line.startsWith('(') && (line.endsWith('),') || line.endsWith(');')) && !line.includes('INSERT INTO')) {
                    const vals = parseSqlValues(line);

                    if (currentTable === 'bot_commands' && vals.length >= 3) {
                        // (id, command, response, created_at)
                        const id = vals[0];
                        const cmd = vals[1];
                        const res = vals[2];
                        const cat = vals[3] || new Date().toISOString().slice(0, 19).replace('T', ' ');
                        await connection.query(
                            'INSERT INTO bot_commands (id, command, response, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
                            [id, cmd, res, cat, cat]
                        );
                    } else if (currentTable === 'kas' && vals.length >= 4) {
                        // (id, nomor, nama, jumlah, tanggal)
                        const id = vals[0];
                        const nomor = vals[1];
                        const nama = vals[2];
                        const jumlah = vals[3];
                        const tanggal = vals[4] || new Date().toISOString().slice(0, 19).replace('T', ' ');
                        await connection.query(
                            'INSERT INTO kas (id, nomor, nama, jumlah, tanggal) VALUES (?, ?, ?, ?, ?)',
                            [id, nomor, nama, jumlah, tanggal]
                        );
                    } else if (currentTable === 'users' && vals.length >= 4) {
                        // (id, username, password, created_at, status, role)
                        const id = vals[0];
                        const username = vals[1];
                        const pass = vals[2];
                        const cat = vals[3] || new Date().toISOString().slice(0, 19).replace('T', ' ');
                        const status = (vals[4] || 'PENDING').toUpperCase();
                        const role = (vals[5] || 'USER').toUpperCase();
                        await connection.query(
                            'INSERT INTO users (id, username, password, status, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [id, username, pass, status, role, cat, cat]
                        );
                    }
                }
            }
            console.log('   OK: Legacy data imported.');
        }

        console.log('6. Seeding/Updating default admin...');
        const adminPass = 'Rsdk#admin*1';
        const hash = await bcrypt.hash(adminPass, 10);

        // We use REPLACE or UPDATE to ensure that even if migrated, the admin password is what the user expects
        const [adminExists] = await connection.query('SELECT id FROM users WHERE username = ?', ['admin']);
        if (adminExists.length > 0) {
            await connection.query(
                'UPDATE users SET password = ?, status = "APPROVED", role = "ADMIN" WHERE username = ?',
                [hash, 'admin']
            );
            console.log('   OK: Admin password reset to default.');
        } else {
            await connection.query(
                'INSERT INTO users (username, password, status, role) VALUES (?, ?, ?, ?)',
                ['admin', hash, 'APPROVED', 'ADMIN']
            );
            console.log('   OK: Admin created.');
        }

        console.log('--- INITIALIZATION COMPLETED ---');
    } catch (err) {
        console.error('!!! INITIALIZATION FAILED !!!');
        console.error(err);
    } finally {
        if (connection) await connection.end();
    }
}

main();

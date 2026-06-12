require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const sanitizeErrorMessage = (message) =>
    String(message).replace(
        /mysql:\/\/([^:\s]+):([^@\s]+)@/gi,
        "mysql://$1:<redacted>@"
    );

const migrationsDir =
    path.join(__dirname, "..", "..", "migrations");

const splitSqlStatements =
    (sql) => {

        const statements = [];
        let delimiter = ";";
        let buffer = "";

        sql.split(/\r?\n/).forEach((line) => {

            const trimmed =
                line.trim();

            const delimiterMatch =
                trimmed.match(/^DELIMITER\s+(.+)$/i);

            if (delimiterMatch) {

                delimiter =
                    delimiterMatch[1];

                return;
            }

            buffer += `${line}\n`;

            if (
                buffer.trimEnd().endsWith(delimiter)
            ) {

                const statement =
                    buffer
                        .trim()
                        .slice(0, -delimiter.length)
                        .trim();

                if (statement) {

                    statements.push(statement);
                }

                buffer = "";
            }
        });

        const tail =
            buffer.trim();

        if (tail) {

            statements.push(tail);
        }

        return statements;
};

const getMigrationFiles =
    () => {

        const requested =
            process.argv
                .slice(2)
                .map((name) => path.basename(name));

        const files =
            fs.readdirSync(migrationsDir)
                .filter((file) => file.endsWith(".sql"))
                .sort();

        if (!requested.length) {

            return files;
        }

        return files.filter((file) =>
            requested.includes(file) ||
            requested.includes(file.replace(/\.sql$/i, ""))
        );
};

const ensureMigrationTable =
    async (connection) => {

        await connection.query(
            `CREATE TABLE IF NOT EXISTS schema_migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );
};

const getAppliedMigrations =
    async (connection) => {

        const [rows] =
            await connection.query(
                "SELECT migration_name FROM schema_migrations"
            );

        return new Set(
            rows.map((row) => row.migration_name)
        );
};

const runMigrationFile =
    async (
        connection,
        file
    ) => {

        const sql =
            fs.readFileSync(
                path.join(migrationsDir, file),
                "utf8"
            );

        const statements =
            splitSqlStatements(sql);

        console.log(
            `Running ${file} (${statements.length} statements)`
        );

        for (const statement of statements) {

            await connection.query(statement);
        }

        await connection.query(
            "INSERT IGNORE INTO schema_migrations (migration_name) VALUES (?)",
            [file]
        );
};

const main =
    async () => {

        const connection =
            await pool.getConnection();

        try {

            await ensureMigrationTable(connection);

            const requested =
                process.argv.slice(2);

            if (!requested.length) {

                console.log(
                    "Pass a migration file name, for example: npm run migrate -- 017_create_review_photos_table.sql"
                );

                return;
            }

            const applied =
                await getAppliedMigrations(connection);

            const files =
                getMigrationFiles()
                    .filter((file) =>
                        requested.length ||
                        !applied.has(file)
                    );

            if (!files.length) {

                console.log("No migrations to run.");
                return;
            }

            for (const file of files) {

                await runMigrationFile(
                    connection,
                    file
                );
            }

            console.log("Migrations completed successfully.");

        } finally {

            connection.release();
            await pool.end();
        }
};

main().catch((error) => {

    console.error("Migration failed:", sanitizeErrorMessage(error.message));
    process.exit(1);
});

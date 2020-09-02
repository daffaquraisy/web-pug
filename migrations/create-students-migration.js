var Client = require('mysql2');

var conn = Client.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbmysql'
});

const sql = `
    CREATE TABLE students (
        id int(11) unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191),
        nis VARCHAR(191),
        nisn VARCHAR(191),
        address VARCHAR(191),
        no_telp VARCHAR(191),
        kelas VARCHAR(191)
    )
`;

conn.query(sql, function (error, result) {
    if (error) {
        console.log('Table gagal dibuat');
        throw error;
    }

    console.log('Tabel berhasil di buat');
});

conn.end();
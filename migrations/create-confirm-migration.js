var Client = require('mysql2');

var conn = Client.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbmysql'
});

const sql = `
    CREATE TABLE confirm (
        id int(11) unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191),
        kelas VARCHAR(191),
        link_image VARCHAR(191)
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
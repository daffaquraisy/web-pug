var Client = require('mysql2');

var conn = Client.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbmysql'
});

const sql = `
    CREATE TABLE invoices (
        id int(11) unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(191),
        bulan VARCHAR(191),
        tahun VARCHAR(191),
        total int,
        student_id int(11) unsigned,
        status VARCHAR(191),
        FOREIGN KEY (student_id) REFERENCES students(id) ON UPDATE CASCADE ON DELETE CASCADE
    )
`;

conn.query(sql, function (error, result) {
    if (error) {
        console.log('Tabel gagal di buat')
        throw error;
    }

    console.log('Tabel berhasil di buat');
});

conn.end();
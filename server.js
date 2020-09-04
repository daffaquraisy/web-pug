var http = require('http');
var pug = require('pug');
var NodeSession = require('node-session');
var qs = require('querystring');
var Client = require('mysql2');
var url = require('url');

var loginPug = "./templates/loginForm.pug";
var loginPug1 = "./templates/loginForm1.pug";
var dashboardPug = "./templates/dashboard.pug";
var usersList = "./templates/users/list.pug";
var register = "./templates/register.pug"

var studentsList = "./templates/students/list.pug";
var studentAdd = "./templates/students/addStudent.pug";
var studentEdit = "./templates/students/editStudent.pug";

var listInvoices = "./templates/invoices/list.pug";
var addInvoices = "./templates/invoices/addInvoices.pug";
var editInovices = "./templates/invoices/editInvoices.pug";

var listConfirm = "./templates/confirm/list.pug";
var addConfirm = "./templates/confirm/addConfirm.pug";

var db = Client.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbmysql'
});

var session = new NodeSession({
    secret: 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD',
    lifetime: '6000000'
});

var server = http.createServer(function (request, response) {

    session.startSession(request, response, function () {

        if (request.url === "/") {

            response.writeHead(200, {
                "Content-Type": "text/html"
            });
            var template = pug.renderFile(loginPug);
            response.end(template);

        } else if (request.url === '/register') {

            switch (request.method) {
                case 'GET':

                    var template = pug.renderFile(register)

                    response.end(template)
                    break;

                case 'POST':
                    var body = '';

                    request.on('data', function (data) {
                        body += data
                    })

                    request.on('end', function () {
                        var form = qs.parse(body)
                        var newRow = [
                            form['user_id'],
                            form['user_nama'],
                            form['user_password'],
                        ];

                        var sql = 'INSERT INTO users VALUES (?,?,md5(?))';

                        db.query(sql, newRow, function (error, result) {
                            if (error) {
                                throw error;
                            }

                            // kode untuk direct ke root 
                            response.writeHead(302, {
                                'Location': '/add-confirm'
                            })
                            response.end();

                        })
                    })

                default:
                    break;
            }

        } else if (request.url === "/admin-login") {

            response.writeHead(200, {
                "Content-Type": "text/html"
            });
            var template = pug.renderFile(loginPug1);
            response.end(template);

        } else if (request.url === "/login" && request.method === "POST") {

            var body = '';

            request.on('data', function (data) {
                body += data;
            });

            request.on('end', function () {

                var form = qs.parse(body);
                var params = [
                    form['user_nama'],
                    form['user_password']
                ];

                var sql = `SELECT COUNT(*) AS cnt FROM users WHERE user_nama = ? AND user_password = md5(?)`;

                db.query(sql, params, function (error, result) {

                    if (error) {
                        throw error;
                    }
                    var n = result[0]['cnt'];
                    console.log(`Nilai n adalan ${n}`);
                    if (n > 0) {
                        // login berhasil
                        request.session.put("user_nama", params[0]);
                        // redirect ke halaman utama 
                        response.writeHead(302, {
                            'Location': '/add-confirm'
                        });
                        response.end();
                    } else {
                        response.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        var template = pug.renderFile(loginPug, {
                            msg: "User ID atau password salah !!"
                        });
                        response.end(template);
                    }
                });
            });

        } else if (request.url === "/admin_login" && request.method === "POST") {

            var body = '';

            request.on('data', function (data) {
                body += data;
            });

            request.on('end', function () {

                var form = qs.parse(body);
                var params = [
                    form['user_nama'],
                    form['user_password']
                ];

                var sql = `SELECT COUNT(*) AS cnt FROM users WHERE user_nama = ? AND user_password = md5(?)`;

                db.query(sql, params, function (error, result) {

                    if (error) {
                        throw error;
                    }
                    var n = result[0]['cnt'];
                    console.log(`Nilai n adalan ${n}`);
                    if (n > 0) {
                        // login berhasil
                        request.session.put("user_nama", params[0]);
                        // redirect ke halaman utama 
                        response.writeHead(302, {
                            'Location': '/main'
                        });
                        response.end();
                    } else {
                        response.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        var template = pug.renderFile(loginPug1, {
                            msg: "User ID atau password salah !!"
                        });
                        response.end(template);
                    }
                });
            });

        } else if (request.url === '/users') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            db.query('SELECT * FROM users', function (error, result) {
                if (error) {
                    throw error;
                }

                var template = pug.renderFile(usersList, {
                    users: result
                })
                response.end(template)
            })

        } else if (request.url === '/students') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            db.query('SELECT * FROM students', function (error, result) {
                if (error) {
                    throw error;
                }

                var template = pug.renderFile(studentsList, {
                    students: result
                })

                response.end(template);
            })

        } else if (request.url === '/add-student') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            switch (request.method) {
                case 'GET':

                    var template = pug.renderFile(studentAdd)

                    response.end(template)
                    break;

                case 'POST':
                    var body = '';

                    request.on('data', function (data) {
                        body += data
                    })

                    request.on('end', function () {
                        var form = qs.parse(body)
                        var newRow = [
                            form['id'],
                            form['name'],
                            form['nis'],
                            form['nisn'],
                            form['address'],
                            form['no_telp'],
                            form['kelas']
                        ];

                        var sql = 'INSERT INTO students VALUES (?,?,?,?,?,?,?)';

                        db.query(sql, newRow, function (error, result) {
                            if (error) {
                                throw error;
                            }

                            // kode untuk direct ke root 
                            response.writeHead(302, {
                                'Location': '/students'
                            })
                            response.end();

                        })
                    })

                default:
                    break;
            }

        } else if (url.parse(request.url).pathname === '/edit-student') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            switch (request.method) {
                case 'GET':
                    var id = qs.parse(url.parse(request.url).query).id;

                    var sql = 'SELECT * FROM students WHERE id = ?';

                    db.query(sql, [id], function (error, result) {
                        if (error) {
                            throw error;
                        }
                        console.log(result[0]);

                        var template2 = pug.renderFile(studentEdit, {
                            student: result[0]
                        })

                        response.end(template2)

                    })

                    break;

                case 'POST':
                    var body = ''

                    request.on('data', function (data) {
                        body += data
                    })

                    request.on('end', function () {
                        var form = qs.parse(body)
                        var params = [
                            form['name'],
                            form['nis'],
                            form['nisn'],
                            form['address'],
                            form['no_telp'],
                            form['kelas'],
                            form['id'],
                        ];

                        var sql = `
                        UPDATE students
                            SET
                                name=?,
                                nis=?,
                                nisn=?,
                                address=?,
                                no_telp=?,
                                kelas=?
                            WHERE
                                id=?
                            `;
                        db.query(sql, params, function (error, result) {
                            if (error) {
                                throw error
                            }
                            // kode untuk direct ke root 
                            response.writeHead(302, {
                                'Location': '/students'
                            })
                            response.end();
                        })
                    })

                    break;


                default:
                    console.log('Metode tidak dikenali');
            }

        } else if (url.parse(request.url).pathname === '/delete-student') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            var id = qs.parse(url.parse(request.url).query).id;

            var sql = 'DELETE FROM students WHERE id = ?';

            db.query(sql, [id], function (error, result) {
                if (error) {
                    throw error
                }
                // kode untuk direct ke root 
                response.writeHead(302, {
                    'Location': '/students'
                })
                response.end();
            })



        } else if (request.url === '/invoices') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            // var sql = `
            // SELECT 
            //     invoices.id,
            //     invoices.code,
            //     invoices.bulan,
            //     invoices.tahun,
            //     invoices.total,
            //     invoices.status,
            //     students.name,
            // FROM invoices
            // INNER JOIN students ON invoices.student_id=students.id
            // `;

            var sql = 'SELECT * FROM invoices';

            db.query(sql, function (error, result) {
                if (error) {
                    throw error
                }
                var template3 = pug.renderFile(listInvoices, {
                    invoices: result
                })
                response.end(template3)
            });


        } else if (request.url === '/add-invoices') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            switch (request.method) {
                case 'GET':
                    var template = pug.renderFile(addInvoices)
                    response.end(template)
                    break;

                case 'POST':
                    var body = ''

                    request.on('data', function (data) {
                        body += data
                    })

                    request.on('end', function () {
                        var form = qs.parse(body)
                        var newRow = [
                            form['id'],
                            form['code'],
                            form['bulan'],
                            form['tahun'],
                            form['total'],
                            // form['status'],
                            form['student_id']
                        ];

                        var sql = 'INSERT INTO invoices VALUES(?,?,?,?,?,?)';
                        db.query(sql, newRow, function (error, result) {
                            if (error) {
                                throw error
                            }
                            // kode untuk direct ke root 
                            response.writeHead(302, {
                                'Location': '/invoices'
                            })
                            response.end();
                        })
                    })
                    break;

                default:
                    console.log('Metode tidak dikenali');

            }

        } else if (url.parse(request.url).pathname === '/edit-invoice') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            switch (request.method) {
                case 'GET':
                    var id = qs.parse(url.parse(request.url).query).id;
                    var sql = 'SELECT * FROM invoices WHERE id = ?';
                    db.query(sql, [id], function (error, result) {
                        if (error) {
                            throw error
                        }
                        console.log(result[0]);

                        var template5 = pug.renderFile(editInovices, {
                            invoice: result[0]
                        })


                        response.end(template5)
                    })

                    break;

                case 'POST':
                    var body = ''

                    request.on('data', function (data) {
                        body += data
                    })

                    request.on('end', function () {
                        var form = qs.parse(body)
                        var params = [
                            form['id'],
                            form['code'],
                            form['bulan'],
                            form['tahun'],
                            form['total'],
                            // form['status'],
                            form['student_id']
                        ];

                        var sql = `
                            UPDATE invoices
                                SET
                                    code=?,
                                    bulan=?,
                                    tahun=?,
                                    total=?,
                                    student_id=?
                                WHERE
                                    id=?
                        `;
                        db.query(sql, params, function (error, result) {
                            if (error) {
                                throw error
                            }
                            // kode untuk direct ke root 
                            response.writeHead(302, {
                                'Location': '/invoices'
                            })
                            response.end();
                        })
                    })

                    break;

                default:
                    console.log('Metode tidak dikenali');

            }
        } else if (url.parse(request.url).pathname === '/delete-invoice') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            var id = qs.parse(url.parse(request.url).query).id;
            var sql = 'DELETE FROM invoices WHERE id = ?';
            db.query(sql, [id], function (error, result) {
                if (error) {
                    throw error
                }
                // kode untuk direct ke root 
                response.writeHead(302, {
                    'Location': '/invoices'
                })
                response.end();
            })
        } else if (request.url === '/confirms') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            db.query('SELECT * FROM confirm', function (error, result) {
                if (error) {
                    throw error
                }
                var template = pug.renderFile(listConfirm, {
                    confirms: result
                })
                response.end(template)
            });
        } else if (request.url === '/add-confirm') {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            switch (request.method) {
                case 'GET':
                    var template = pug.renderFile(addConfirm)
                    response.end(template)
                    break;

                case 'POST':
                    var body = ''

                    request.on('data', function (data) {
                        body += data
                    })

                    request.on('end', function () {
                        var form = qs.parse(body)
                        var newRow = [
                            form['id'],
                            form['name'],
                            form['kelas'],
                            form['link_image']
                        ];

                        var sql = 'INSERT INTO confirm VALUES(?,?,?,?)';
                        db.query(sql, newRow, function (error, result) {
                            if (error) {
                                throw error
                            }
                            // kode untuk direct ke root 
                            response.writeHead(302, {
                                'Location': '/add-confirm'
                            })
                            response.end();
                        })
                    })
                    break;

                default:
                    console.log('Metode tidak dikenali');

            }
        } else if (request.url === "/main") {

            if (!request.session.has('user_nama')) {
                // redirect ke form login
                response.writeHead(302, {
                    'Location': '/'
                });
                response.end();
            }

            var user_nama = request.session.get('user_nama');
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            // menampilkan ke halaman utama
            var template = pug.renderFile(dashboardPug, {
                user_nama: user_nama
            });
            response.end(template);

        } else if (request.url === "/logout") {

            if (request.session.has('user_nama')) {
                request.session.forget('user_nama');
            }

            // direcct ke login
            response.writeHead(302, {
                'Location': '/'
            });
            response.end();


        } else {
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.end('Halaman tidak ditemukan');
        }

    });
});

server.listen(3000);
console.log('Server berjalan di localhost:3000');
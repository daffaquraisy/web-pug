var http = require('http');
var pug = require('pug');
var NodeSession = require('node-session');
var qs = require('querystring');
var Client = require('mysql2');
var url = require('url');

var loginPug = "./templates/loginForm.pug";
var dashboardPug = "./templates/dashboard.pug";
var usersList = "./templates/users/list.pug";

var studentsList = "./templates/students/list.pug";
var studentAdd = "./templates/students/addStudent.pug";
var studentEdit = "./templates/students/editStudent.pug";

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
                            'Location': '/main'
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
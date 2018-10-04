class Database {
    initializeConnection() {
        return new Promise((resolve, reject) => {
            r.connect({
                host: 'localhost',
                port: 28015
            }, function (err, conn) {
                if (err) return reject(err.message);
                resolve(conn);
            });
        });
    }

    insertData(data) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('users').insert(data).run(r.connection, function (err, result) {
                if (err) {
                    return reject({success: false});
                } else {
                    return resolve({success: true, result: result});
                }
            });
        });
    }

    deleteData(table_name, data_id) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table(table_name).get(data_id).delete().run(r.connection, function (err, result) {
                if (err) {
                    return reject({success: false});
                } else {
                    return resolve({success: true, result: result});
                }
            });
        });
    }

    viewUser(user_id) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('users').get(user_id).run(r.connection, function (err, result) {
                if (err) {
                    return reject(err.message);
                } else {
                    if (result == null) {
                        return reject("Not found.");
                    } else {
                        return resolve(result);
                    }
                }
            });
        });
    }

    updateUser(user_id, data) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('users').filter({
                id: user_id
            }).update(data).run(r.connection, function (err, result) {
                if (err) return reject(err.message);
                return resolve(result);
            });
        });
    }

    viewUsers() {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('users').run(r.connection, function (err, cursor) {
                if (err) {
                    return reject(err.message);
                } else {
                    cursor.toArray(function (err, result) {
                        if (err) return reject(err.message);
                        return resolve(result);
                    });
                }
            });
        });
    }

    createTable(tablename) {
        return new Promise((resolve, reject) => {
            r.db('neombet').tableCreate(tablename).run(r.connection, function (err, result) {
                if (err) return reject(err.message);
                return resolve({success: true});
            });
        });
    }

    dropTable(tablename) {
        return new Promise((resolve, reject) => {
            r.db('neombet').tableDrop(tablename).run(r.connection, function (err, result) {
                if (err) return reject(err.message);
                return resolve({success: true});
            });
        });
    }

    createDatabase(dbname) {
        return new Promise((resolve, reject) => {
            r.dbCreate(dbname).run(r.connection, (err) => {
                if (!err) return resolve({success: true, error: null});
                return reject({success: false, error: err.message})
            });
        });
    }

    deleteDatabase(dbname) {
        return new Promise((resolve, reject) => {
            r.dbDrop(dbname).run(r.connection, (err) => {
                if (!err) return resolve({success: true, error: null});
                return reject({success: false, error: err.message})
            });
        });
    }
}

module.exports = Database;
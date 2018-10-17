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

    insertData(table, data) {
        return new Promise((resolve, reject) => {
            r.db(process.env.DB_NAME).table(table).insert(data).run(r.connection, function (err, result) {
                if (err) return reject(err);
                return resolve(result);
            });
        });
    }

    updateData(table, filter, data) {
        return new Promise((resolve, reject) => {
            r.db(process.env.DB_NAME).table(table).filter(filter).update(data).run(r.connection, function (err, result) {
                if (err) return reject(err.message);
                return resolve(result);
            });
        });
    }

    viewData(table, filter, _data) {
        return new Promise((resolve, reject) => {
            r.db(process.env.DB_NAME).table(table).filter(filter).pluck(_data).run(r.connection, function (err, cursor) {
                if (err)
                    return reject(err.message);
                cursor.toArray(function (err, result) {
                    if (err) return reject(err.message);
                    return resolve(result);
                });
            });
        });
    }

    deleteData(table_name, data_id) {
        return new Promise((resolve, reject) => {
            r.db(process.env.DB_NAME).table(table_name).get(data_id).delete().run(r.connection, function (err, result) {
                if (err) {
                    return reject({success: false});
                } else {
                    return resolve({success: true, result: result});
                }
            });
        });
    }

    createTable(tablename) {
        return new Promise((resolve, reject) => {
            r.db(process.env.DB_NAME).tableCreate(tablename).run(r.connection, function (err, result) {
                if (err) return reject(err.message);
                return resolve({success: true});
            });
        });
    }

    dropTable(tablename) {
        return new Promise((resolve, reject) => {
            r.db(process.env.DB_NAME).tableDrop(tablename).run(r.connection, function (err, result) {
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

    // addSubscriber(table, id, data) {
    //     return new Promise((resolve, reject) => {
    //         r.db(process.env.DB_NAME).table(table).get(id)
    //             .update({
    //                 subscribers: r.row('subscribers').append(payload.data)
    //             }).run(r.connection, function (err, result) {
    //             if (err) {
    //                 return reject({success: false});
    //             } else {
    //                 return resolve({success: true, result: result});
    //             }
    //         });
    //     });
    // }
}

module.exports = Database;
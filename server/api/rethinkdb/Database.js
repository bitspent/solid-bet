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
            r.db('neombet').table('matches').insert(data).run(r.connection, function (err, result) {
                if (err) {
                    return reject({success: false});
                } else {
                    return resolve({success: true, result: result});
                }
            });
        });
    }

    insertTransaction(payload) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('contracts').insert({
                id: payload.id,
                contracts: [payload.data]
            }).run(r.connection, function (err, result) {
                if (err) {
                    return reject({success: false});
                } else {
                    return resolve({success: true, result: result});
                }
            });
        });
    }

    appendTransaction(payload) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('contracts').get(payload.id)
                .update({
                    contracts: r.row('contracts').append(payload.data)
                }).run(r.connection, function (err, result) {
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

    viewMatch(match_id) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('matches').get(match_id).run(r.connection, function (err, result) {
                if (err) {
                    return reject(err.message);
                } else {
                    return resolve(result);
                }
            });
        });
    }

    viewMatchTransactions(match_id) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('contracts').get(match_id).run(r.connection, function (err, result) {
                if (err) {
                    return reject(err.message);
                } else {
                    return resolve(result);
                }
            });
        });
    }

    updateMatch(match_id, data) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('matches').filter({
                id: match_id
            }).update(data).run(r.connection, function (err, result) {
                if (err) return reject(err.message);
                return resolve(result);
            });
        });
    }

    viewMatches() {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('matches').run(r.connection, function (err, cursor) {
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

    viewMatchesTransactions() {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('contracts').run(r.connection, function (err, cursor) {
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

    updatePendingContract(transactionHash, data) {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('contracts').filter(function (contract) {
                return contract['transactionHash'] === transactionHash;
            }).update({
                // contracts: data
            }).run(r.connection, function (err, result) {
                if (err) {
                    return reject({success: false});
                } else {
                    return resolve({success: true, result: result});
                }
            });
        });
    }

    viewPendingContracts() {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('contracts').filter(function (contract) {
                return contract['contractAddress'] == null;
            }).run(r.connection, function (err, cursor) {
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

    viewActiveContracts() {
        return new Promise((resolve, reject) => {
            r.db('neombet').table('contracts').filter(function (contract) {
                return contract['contractAddress'] != null;
            }).run(r.connection, function (err, cursor) {
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
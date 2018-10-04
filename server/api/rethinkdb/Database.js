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


// let footballdata = new (require('../api/matches/FootballData'))('ed06bf4058f04f9288f8fe44a55bc263');

// footballdata.getLeagueMatches('CL').then(matches=>{
//     console.log(JSON.stringify(matches))
// }).catch(err=>console.log(err))


// footballdata.getMarchDetails(200063).then(matches=>{
//     console.log(matches)
// }).catch(err=>console.log(err))

// let MATCHES = require('./matches');
// let KEYED_MATCHES = require('./keyed_matches');

module.exports = Database;
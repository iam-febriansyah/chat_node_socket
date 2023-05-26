async function dbAccess(db) {
    try {
        await db.sequelize.authenticate().then(function (err) {
            if (!err) {
                db.sequelize.sync({ force: false }).then(() => {
                    console.log(db.name + " Main Database already connected!");
                });
            }
        });
    } catch (error) {
        console.error("Unable to connect to the database: " + db.name, error);
    }
}

module.exports = async function (app) {
    try {
        const db = require("./config");
        console.log(db.name);
        await dbAccess(db);
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

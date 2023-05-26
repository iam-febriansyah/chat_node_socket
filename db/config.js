const dotenv = require("dotenv");
dotenv.config();
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
    process.env.DATABASE_DB,
    process.env.USER_DB,
    process.env.PASSWORD_DB,
    {
        host: process.env.HOST_DB,
        logging: false,
        dialect: "sqlite",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
            connectTimeout: 20000,
        },
        storage: "./db/chats.sqlite",
    }
);
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.name = process.env.DATABASE_DB;

db.users = require("./tables/users")(sequelize, Sequelize, DataTypes);
db.user_details = require("./tables/user_details")(
    sequelize,
    Sequelize,
    DataTypes
);
db.roles = require("./tables/roles")(sequelize, Sequelize, DataTypes);
db.role_users = require("./tables/role_users")(sequelize, Sequelize, DataTypes);
db.chats = require("./tables/chats")(sequelize, Sequelize, DataTypes);

module.exports = db;

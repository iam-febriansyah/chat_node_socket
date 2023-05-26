module.exports = (sequelize, Sequelize) => {
    const chats = sequelize.define(
        "chats",
        {
            chat_id: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            from_user_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            to_user_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            file: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            time_zone: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            read_at: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            deleted_at: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at_server: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            deleted_at_server: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: "chats",
            indexes: [
                {
                    unique: true,
                    fields: ["chat_id"],
                },
                {
                    unique: false,
                    fields: ["from_user_id"],
                },
                {
                    unique: false,
                    fields: ["to_user_id"],
                },
            ],
        }
    );
    return chats;
};

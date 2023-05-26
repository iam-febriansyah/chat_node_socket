module.exports = (sequelize, Sequelize) => {
    const users = sequelize.define(
        "users",
        {
            user_id: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            forgot_code: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            activate: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            is_online :{
                type: Sequelize.STRING,
                allowNull: true,
            },
            update_at: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: "user",
            indexes: [
                {
                    unique: true,
                    fields: ["user_id"],
                },
                {
                    unique: true,
                    fields: ["email"],
                },
            ],
        }
    );
    return users;
};

module.exports = (sequelize, Sequelize) => {
    const role_users = sequelize.define(
        "role_users",
        {
            role_user_id: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            role_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: "role_user",
            indexes: [
                {
                    unique: true,
                    fields: ["role_user_id"],
                },
                {
                    unique: false,
                    fields: ["role_id"],
                },
            ],
        }
    );
    return role_users;
};

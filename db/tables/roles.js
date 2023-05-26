module.exports = (sequelize, Sequelize) => {
    const roles = sequelize.define(
        "roles",
        {
            role_id: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            role_name: {
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
            tableName: "role",
            indexes: [
                {
                    unique: true,
                    fields: ["role_id"],
                },
            ],
        }
    );
    return roles;
};

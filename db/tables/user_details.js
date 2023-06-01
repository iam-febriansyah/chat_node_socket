module.exports = (sequelize, Sequelize) => {
  const user_details = sequelize.define(
    "user_details",
    {
      user_detail_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status_update: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      tableName: "user_details",
      indexes: [
        {
          unique: true,
          fields: ["user_detail_id"],
        },
        {
          unique: true,
          fields: ["user_id"],
        },
      ],
    }
  );
  return user_details;
};

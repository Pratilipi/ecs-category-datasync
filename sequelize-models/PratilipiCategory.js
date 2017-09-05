"use strict";
module.exports = function(sequelize, DataTypes) {
  var PratilipiCategory = sequelize.define("pratilipis_categories", {
    pratilipi_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    }
  });

  PratilipiCategory.associate = function(models) {
    PratilipiCategory.belongsTo(models.Category);
  };
  return PratilipiCategory;
};

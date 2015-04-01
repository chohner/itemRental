"use strict";

module.exports = function(sequelize, DataTypes) {
  var Item = sequelize.define("Item", {

      // Label with custom getter that zero fills 4 chars
      label: {
        type: DataTypes.INTEGER(4).UNSIGNED,
        allowNull: false,
        get: function(){
          return ("000"+this.getDataValue('label')).slice(-4);
        }
      },
      name: {type: DataTypes.TEXT, allowNull: false,notNull: true},
      description: DataTypes.TEXT,
      category: DataTypes.TEXT,
      url: DataTypes.STRING,
      location: DataTypes.TEXT, // room shelf.level
      status: DataTypes.STRING, //in,out,nocirc
      condition: DataTypes.STRING, // good, mended, broken
      comment: DataTypes.TEXT //repair history etc
    }, {
    classMethods: {
      associate: function(models) {
        Item.belongsTo(models.User);
      }
    }
  });

  return Item;
};

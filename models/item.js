"use strict";

module.exports = function(sequelize, DataTypes) {
  var Item = sequelize.define("Item", {

      // Label with custom getter that zero fills 4 chars
      Label: {
        type: DataTypes.INTEGER(4).UNSIGNED,
        allowNull: false,
        get: function(){
          return ("000"+this.getDataValue('Label')).slice(-4);
        }
      },
      Item: {type: DataTypes.TEXT, allowNull: false,notNull: true},
      Description: DataTypes.TEXT,
      Serial: DataTypes.TEXT,
      Category: DataTypes.TEXT,
      URL: DataTypes.STRING,
      Location: DataTypes.TEXT, // room shelf.level
      Status: DataTypes.STRING, //in,out,nocirc
      Condition: DataTypes.STRING, // good, mended, broken
      Comment: DataTypes.TEXT //repair history etc
    }, {
    classMethods: {
      associate: function(models) {
        Item.belongsTo(models.User);
      }
    }
  });

  return Item;
};

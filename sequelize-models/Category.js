"use strict";


module.exports = function(sequelize, DataTypes) {
  var Category = sequelize.define("categories", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    language: {
      type: DataTypes.ENUM,
      values: ['HINDI', 'MARATHI', 'KANNADA', 'TAMIL', 'TELUGU', 'BENGALI', 'GUJARATI', 'MALAYALAM'],
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100) + ' CHARSET utf8 COLLATE utf8_unicode_ci',
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1,30]
      },
      set(val) {
        this.setDataValue('name', val.toLowerCase());
      }
    },
    name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        notEmpty: true,
        len: [1,30]
      }
    },
    content_type: {
      type: DataTypes.ENUM,
      values: ['ARTICLE', 'POEM', 'STORY'],
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ['SYSTEM', 'SUGGESTED'],
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    page_url: {
      type: DataTypes.VIRTUAL,
      get: function() {
        if(this.type === 'SYSTEM') {
          return `/categories/${this.name_en}`;
        } else {
          return `/tags/${this.id}`;
        }
      }
    }
  }, {
    indexes: [
      // Create a unique index on poem
      {
        // fields: ['language', 'type', 'is_active', 'name']
        fields: ['language']
      },
      // {
      //   fields: ['id', 'is_active']
      // },
      {
        unique: true,
        fields: ['language', 'content_type', 'type', 'name']
      }
    ]
  });
  return Category;
};

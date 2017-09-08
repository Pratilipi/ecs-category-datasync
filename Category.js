var _ = require('lodash');

var db = require('./sequelize-models');

module.exports = {
  fkFailedPratilipiIds: [],
  checkAllSystemCategoriesPresent(pratilipiId, systemCategories) {
    return new Promise(function(resolve, reject) {
      db.Category.count({
        where: {
          id: {
            $in: systemCategories
          }
        }
      })
      .then(count => {
        if(count == systemCategories.length) {
          resolve();
        } else {
          reject({
            pratilipiId: pratilipiId,
            type: 'FK constraint failed',
            categoryIds: systemCategories
          });
        }
      })
      ;
    });
  },
  getSystemCategories(language) {
    return db.Category.findAll({
      attributes: ['id', 'name', 'name_en', 'content_type', 'type'],
      where: {
        language: language,
        type: 'SYSTEM',
        is_active: true
      },
      order: ['name']
    })
    .then(categories => {
      return categories.map((category) => {
        return category.get({
          plain: true
        });
      });
    })
  },

  deletePratilipiCategories(pratilipiId) {
    return db.PratilipiCategory.destroy({
      where: {
        pratilipi_id: pratilipiId
      }
    });
  },

  insertCategoriesInPratilipi(pratilipiId, language, contentType, systemCategories, suggestedCategories, timestamp) {
    //1234, 'HINDI', 'ARTICLE', [12, 45], ['abc' 'def']
    //find all suggested categories that already exist in db
    //the ones which exist, have an id , add them to relationship ids to be inserted only if their state is active
    //the ones which dont exist, create records for them,
    //with the ids of new suggested categories, add to relationship ids to be inserted in p_c,
    //delete all records which were associated with that pratilipi_id,
    //add new records in p_c corresponding to the new ids
    var categoryIdsForPratilipisCategories = (systemCategories && systemCategories.length) ? systemCategories : [];
    var prSuggestedCategoryInsertion;
    if(suggestedCategories && suggestedCategories.length) {
      suggestedCategories = suggestedCategories.map(Function.prototype.call, String.prototype.toLowerCase);
      prSuggestedCategoryInsertion = db.Category.findAll({
        attributes: ['id', 'name', 'is_active'],
        where: {
          language: language,
          content_type: contentType,
          type: 'SUGGESTED',
          name: {
            $in: suggestedCategories
          }
        },
        raw: true
      })
      .then(existingSuggestedCategories => {
        var activeExistingSuggestedCategoriesIds = _.map(_.filter(existingSuggestedCategories, 'is_active'), 'id');
        categoryIdsForPratilipisCategories = _.concat(categoryIdsForPratilipisCategories, activeExistingSuggestedCategoriesIds);
        return _.difference(suggestedCategories, _.map(existingSuggestedCategories, 'name'));
      })
      .then(newSuggestedCategoriesNames => {
        //bulk create suggested categories
        var newSuggestedCategories = newSuggestedCategoriesNames.map(name => {
          return {
            language: language,
            name: name,
            content_type: contentType,
            type: 'SUGGESTED'
          };
        });
        return db.Category.bulkCreate(newSuggestedCategories, {
          validate: true
          // individualHooks: true
         });
      })
      .then(newCreatedCategories => {
        categoryIdsForPratilipisCategories = _.concat(categoryIdsForPratilipisCategories, _.map(newCreatedCategories, 'id'));
        return;
      })
      ;
    } else {
      prSuggestedCategoryInsertion = Promise.resolve();
    }

    return prSuggestedCategoryInsertion
      .then(() => {
        if(systemCategories && systemCategories.length) {
          return module.exports.checkAllSystemCategoriesPresent(pratilipiId, systemCategories);
        } else {
          return Promise.resolve();
        }
      })
      .then(() => {
        var transaction = db.sequelize.transaction(function (t) {
          return db.PratilipiCategory.destroy({
            where: {
              pratilipi_id: pratilipiId
            }
          }, {transaction: t}).then(affectedRows => {
            var newPratilipiCategories = categoryIdsForPratilipisCategories.map(categoryId => {
              return {
                pratilipi_id: pratilipiId,
                category_id: categoryId,
                created_at: timestamp,
                updated_at: timestamp
              };
            });
            return db.PratilipiCategory.bulkCreate(newPratilipiCategories, {validate: true});
          }, {transaction: t});
        });

        return transaction;
      })
      .catch(err => {
        if(err.pratilipiId) {
          module.exports.fkFailedPratilipiIds.push(err.pratilipiId);
          console.log('[FK constraint] failed for ' + err.pratilipiId);
          console.log('[FK failed PRATILIPI IDS RIGHT NOW ] are ' + module.exports.fkFailedPratilipiIds);
          return;
        } else {
          return Promise.reject(err);
        }
      })
      ;
  },

  getPratilipiCategories(pratilipiId) {
    return db.PratilipiCategory.findAll({
      attributes: {
        exclude: ['pratilipi_id', 'category_id', 'created_at', 'updated_at']
      },
      include: [{
        attributes: ['id', 'name', 'content_type', 'page_url', 'type', 'name_en'],
        model: db.Category,
        where: {
          is_active: true
        }
      }],
      where: {
        pratilipi_id: pratilipiId
      },
      // raw: true
    })
    .then(pCategoriesResponse => {
      return pCategoriesResponse.map(pCategory => {
        return pCategory.get({plain: true}).category;
      })
    })
    ;
  },
  getPratilipisCategories(pratilipiIds) {
    return db.PratilipiCategory.findAll({
      attributes: {
        exclude: ['category_id', 'created_at', 'updated_at']
      },
      include: [{
        attributes: ['id', 'name', 'content_type', 'page_url', 'type', 'name_en'],
        model: db.Category,
        where: {
          is_active: true
        }
      }],
      where: {
        pratilipi_id: {
          $in: pratilipiIds
        }
      },
      // raw: true
    })
    .then(pCategoriesResponse => {

      var pIdGroupedCategories = _.mapValues(_.groupBy(pCategoriesResponse, 'pratilipi_id'), categoryArray => {
        return categoryArray.map(category => {
          return category.get({plain: true}).category;
        })
      });
      return pIdGroupedCategories;
    })
    ;
  }
};

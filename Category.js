var _ = require('lodash');

var db = require('./sequelize-models');


function removeWrongSystemCategories(systemCategories) {
  return new Promise(function(resolve, reject) {
    db.Category.findAll({
      attributes: ['id'],
      where: {
        id: {
          $in: systemCategories
        },
        type: 'SYSTEM'
      },
      raw: true
    })
    .then(returnedCategories => {
      var wrongSystemCategories = _.difference(systemCategories, returnedCategories);
      console.log(`2. ${wrongSystemCategories} ${returnedCategories}`);
      systemCategories = _.without(systemCategories, wrongSystemCategories);
      console.log(`3. ${systemCategories}`);
      resolve();
    })
  });
}
module.exports = {
  fkFailedPratilipiIds: [],
  lengthFailedPratilipiIds: [],
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
      .catch(err => {
        if(err[0].errors.message == 'Validation error: Validation len on name failed') {
          //reject with pratilipiId and type=length validation error
          return Promise.reject({
            pratilipiId: pratilipiId,
            type: 'LENGTH constraint failed',
            categoryIds: suggestedCategories
          });
        } else {
          return Promise.reject(err);
        }
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
        if(err.pratilipiId && err.type == 'FK constraint failed') {
          module.exports.fkFailedPratilipiIds.push(err.pratilipiId);
          console.log('[FK constraint] failed for ' + err.pratilipiId  + ' for category ids ' + err.categoryIds);
          console.log('[FK failed PRATILIPI IDS RIGHT NOW ] are ' + module.exports.fkFailedPratilipiIds);
          return;
        } else if(err.pratilipiId && err.type == 'LENGTH constraint failed') {
          module.exports.lengthFailedPratilipiIds.push(err.pratilipiId);
          console.log('[LENGTH constraint] failed for ' + err.pratilipiId + ' for categories ' + err.categoryIds);
          console.log('[LENGTH failed PRATILIPI IDS RIGHT NOW ] are ' + module.exports.lengthFailedPratilipiIds);
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
  },
  insertCategoriesInPratilipiForErroneousData(pratilipiId, language, contentType, systemCategories, suggestedCategories, timestamp) {
    systemCategories = (systemCategories && systemCategories.length) ? _.uniq(systemCategories) : [];
    console.log(`1. ${systemCategories}`);
    suggestedCategories = (suggestedCategories && suggestedCategories.length) ? suggestedCategories.map(cat => {
      return cat.substring(0, 30);
    }) : [];

    var categoryIdsForPratilipisCategories;
    return removeWrongSystemCategories(systemCategories)
    .then(() => {
      categoryIdsForPratilipisCategories = (systemCategories && systemCategories.length) ? systemCategories : [];
      return;
    })
    .then(() => {
      if(suggestedCategories && suggestedCategories.length) {
        suggestedCategories = suggestedCategories.map(Function.prototype.call, String.prototype.toLowerCase);
        return db.Category.findAll({
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
        .catch(err => {
          if(err[0].errors.message == 'Validation error: Validation len on name failed') {
            //reject with pratilipiId and type=length validation error
            return Promise.reject({
              pratilipiId: pratilipiId,
              type: 'LENGTH constraint failed',
              categoryIds: suggestedCategories
            });
          } else {
            return Promise.reject(err);
          }
        })
        ;
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
    ;
  }
};

var _ = require('lodash');

var db = require('./sequelize-models');


module.exports = {
  addNewSystemCategories(categoriesData) {
    var categoriesDataForInsertion = categoriesData.map(category => {
      category.type = 'SYSTEM';
      return category;
    });

    return db.Category.bulkCreate(categoriesDataForInsertion, {
      validate: true
      // individualHooks: true
     })
     .then(newCategories => {
       var newIds = _.map(newCategories, 'id');
       console.log(`${newIds.length} categories inserted with ids ${newIds}`);
       return newIds;
     })
     .catch(err => {
       console.log(`[Error occured in creating categories] ${err}`);
       return Promise.reject(err);
     });
     ;
  },

  markSystemCategoryAsSuggested(categoryId) {
    //change type to suggested where id = id
    //if uniqueness constraint fails, find the system category object,
    //find suggested category id where language, content_type, name are same as system,
    //update p_c , changing suggested category id with systme category id,
    //update sugg category to become inactive
    //finally update systme category to suggested
    console.log(`[1. mark ${categoryId} as suggested]`);
    return db.Category.update({
      type: 'SUGGESTED'
    }, {
      where: {
        id: categoryId
      }
    })
    .catch(err => {
      console.log(typeof err, typeof err.errors[0], typeof err.errors[0].type);
      console.log(err);

      if(err.errors[0].type == 'unique violation') {
        return db.Category.findById(categoryId)
          .then(categoryObject => {
            var categoryPlainObject = categoryObject.get({plain: true});
            console.log(`[2. system category object is ${JSON.stringify(categoryPlainObject)}]`);
            return db.Category.findOne({
              where: {
                language: categoryPlainObject.language,
                content_type: categoryPlainObject.content_type,
                type: 'SUGGESTED',
                name: categoryPlainObject.name,
                is_active: true
              },
              raw: true
            })
            ;
          })
          .then(suggCategoryObject => {
            console.log(`[3. suggested category object is ${JSON.stringify(suggCategoryObject)}]`);
            var suggCategoryId = suggCategoryObject.id;
            var transaction = db.sequelize.transaction(function (t) {
              return db.PratilipiCategory.update({
                category_id: categoryId
              }, {
                where: {
                  category_id: suggCategoryId
                }
              }, {transaction: t})
                .then(affectedRows => {
                  console.log(`[4. Updated ${affectedRows} rows in p_c table]`);
                  return db.Category.update({
                    is_active: false
                  }, {
                    where: {
                      id: suggCategoryId
                    }
                  });
              }, {transaction: t})
              .then((affectedRows) => {
                console.log(`[5. Updated ${affectedRows} rows in c table]`);
                return db.Category.update({
                  type: 'SUGGESTED'
                }, {
                  where: {
                    id: categoryId
                  }
                })
              }, {transaction: t});
            });

            return transaction;
          })
      } else {
        return Promise.reject(err);
      }
    })
  },

  markSystemCategoriesAsSuggested(categoryIds) {
    categoryIds = _.map(categoryIds, (category) => {
      return parseInt(category.id);
    });

    var prChanges = [];

    for(var i=0; i<categoryIds.length; i++) {
      prChanges.push(module.exports.markSystemCategoryAsSuggested(categoryIds[i]));
    }

    return Promise.all(prChanges)
      .catch(err => {
        console.log(`[Error occured in deleting categories] ${err}`);
        return Promise.reject(err);
      });

    // return db.Category.update(
    //   { type: 'SUGGESTED' },
    //   {
    //     where: {
    //       id: {
    //         $in: categoryIds
    //       }
    //     }
    //   }
    // )
    // .spread((affectedCount, affectedRows) => {
    //   console.log(`${affectedCount} rows changed to suggested`);
    //   return affectedCount;
    // })
    // .catch(err => {
    //   console.log(`[Error occured in deleting categories] ${err}`);
    //   return Promise.reject(err);
    // });
  },

  updateNames(categoriesData) {
    var prCategoriesUpdate = [];
    for(var i=0; i<categoriesData.length; i++) {
      var id = parseInt(categoriesData[i].id);
      var name = categoriesData[i].name;

      var prUpdate = db.Category.findById(id)
      .then(categoryObject => {
        console.log(categoryObject.get({plain:true}));
        console.log((categoryObject.get({plain:true}).id).toString());
        console.log(_.find(categoriesData, { 'id': (categoryObject.get({plain:true}).id).toString() }));
        var nameToUpdate = _.find(categoriesData, { 'id': (categoryObject.get({plain:true}).id).toString() }).name;
        return categoryObject.update({
          name: nameToUpdate
        });
      });

      prCategoriesUpdate.push(prUpdate);

    }

    return Promise.all(prCategoriesUpdate)
      .then(() => {
        console.log('Updated category names successfully');
        return;
      })
      .catch(err => {
        console.log(`[Error occured in updating names] ${err}`);
        return Promise.reject(err);
      });
  }

};

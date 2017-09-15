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

  markSystemCategoriesAsSuggested(categoryIds) {
    categoryIds = _.map(categoryIds, 'id');
    return db.Category.update(
      { type: 'SUGGESTED' },
      {
        where: {
          id: {
            $in: categoryIds
          }
        }
      }
    )
    .spread((affectedCount, affectedRows) => {
      console.log(`${affectedCount} rows changed to suggested`);
      return affectedCount;
    })
    .catch(err => {
      console.log(`[Error occured in deleting categories] ${err}`);
      return Promise.reject(err);
    });
    ;
  },

  updateNames(categoriesData) {
    var prCategoriesUpdate = [];
    for(var i=0; i<categoriesData.length; i++) {
      var id = parseInt(categoriesData[i].id);
      var name = categoriesData[i].name;

      var prUpdate = db.Category.findById(id)
      .then(categoryObject => {
        console.log(categoryObject.get({plain:true}));
        console.log(categoryObject.get({plain:true}).id);
        console.log(_.find(categoriesData, { 'id': categoryObject.get({plain:true}).id }));
        var nameToUpdate = _.find(categoriesData, { 'id': categoryObject.get({plain:true}).id }).name;
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

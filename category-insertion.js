const pratilipisToAdd = require('./json-data/added_categories');
const pratilipisToUpdate = require('./json-data/updated_categories');
const pratilipisToDelete = require('./json-data/deleted_categories');
var parameterStoreAccessor = require('./helpers/ParameterStoreAccessor');
var CategoryService;
function startInsertion() {
    // CategoryService.updateNames(pratilipisToUpdate)
  // CategoryService.addNewSystemCategories(pratilipisToAdd)
    CategoryService.markSystemCategoriesAsSuggested(pratilipisToDelete);
    // .then(() => {
    //   return CategoryService.markSystemCategoriesAsSuggested(pratilipisToDelete);
    // })
    // .then(() => {
    //   return CategoryService.updateNames(pratilipisToUpdate);
    // })
    .then(() => {
      console.log('All categories successfully updated.');
      process.exit();
    })
    .catch((err) => {
      process.exit();
      console.log(`[ERROR OCCURED] ${err}`);
    })
    ;
}


parameterStoreAccessor.getMySqlDbCredentials()
  .then(config => {
    Object.assign(process.env, config);
    var models = require('./sequelize-models');
    CategoryService = require('./CategoryIngestionService');
    return models.sequelize.authenticate();
  })
  .then(() => {
    startInsertion();
  })
  ;

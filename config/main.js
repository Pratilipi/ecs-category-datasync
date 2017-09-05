var config = {};

config.local = {
  // 'DB_MYSQL_HOST' : 'ecs-devo-user-activity.ctl0cr5o3mqq.ap-southeast-1.rds.amazonaws.com',
  'DB_MYSQL_HOST' : '192.168.0.140',
  'DB_MYSQL_DATABASE': 'database_development',
  'DB_MYSQL_PORT': 3306
};

config.devo = {
  'DB_MYSQL_HOST' : 'ecs-devo-user-activity.ctl0cr5o3mqq.ap-southeast-1.rds.amazonaws.com',
  'DB_MYSQL_DATABASE': 'pratilipi',
  'DB_MYSQL_PORT': 3306
}

module.exports = config;

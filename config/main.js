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
  'DB_MYSQL_PORT': 3306,
  'WRONG_P_IDS' : [5139253646327808,5758763856297984]
}

config.gamma = {
  'DB_MYSQL_HOST':  'product.cr3p1oy4g8ad.ap-southeast-1.rds.amazonaws.com',
  'DB_MYSQL_DATABASE': 'pratilipi',
  'DB_MYSQL_PORT': 3306,
  'WRONG_P_IDS': [4724466131664896, 6042271548440576, 6179178714497024, 4760209275748352, 6011935640780800, 6000695814651904, 5666061018464256, 5392338071846912, 6309315764813824, 6653702759776256, 5844382658330624, 5135061226094592, 5642311705821184, 5258440704786432, 5138649455788032, 5445803011735552, 4847118687141888, 4987300870619136, 5387803830517760, 5588615127105536, 5477045390802944, 5847094594633728, 6058726826442752]
}

module.exports = config;

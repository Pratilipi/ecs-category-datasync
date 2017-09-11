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
  'WRONG_P_IDS': [5357627918778368,6308581392515072,5137262441398272,6177839081586688,5516484582309888,4656258502623232,6489169919475712,5976035296804864,4931061363507200,5805114481180672,6263031301406720,5729956754620416,5523171972218880,5858906076086272,6599162297057280,5730192894984192,5723334317703168,5475643327250432,6653702759776256,5445803011735552,5711272448884736,6454879690686464,5758958370291712,4513889344552960,6661743173435392,4853229308346368,6171689250455552,4737576643592192,6675123650691072,4646153348972544,5844382658330624,5772956927000576,6653395805405184,6269273382060032,5138649455788032,4845606932578304,5562756563468288,5631791116320768,6619062472802304,5900388448862208,4863481504333824,6087677844652032,6063854567030784,5588908451561472,4738496412516352,5127202207694848,5258440704786432,4541945322405888,4770919591968768,5689179317469184,4780839220019200,5853432997478400,5642311705821184,5232332961742848,4815721560276992,4815721560276992,5309488559554560,4772528673783808,5734763839619072,5397706506764288,6309315764813824,5300933679382528,6421416688746496,6259231471697920,4894703909601280,5055335202029568,4736373692039168,4651803417772032,4847118687141888,5502507959189504,5757183006343168,5135061226094592,4724466131664896,6042271548440576,6179178714497024,4760209275748352,5269782474522624,4686133628764160,6011935640780800,4904924517761024,4595491944792064,6000695814651904,5666061018464256,5647942944817152,6081759371329536,5004145265213440,6129770260594688,5403273874898944,6331425576976384,5855099184742400,5405097239511040,6527391648710656,6691016621948928,6343751906623488,4538266941390848,5284854506192896,4818749354409984,6398076105785344,5734810312507392,6402024355135488,5552133273812992,5379455422300160,6135238435012608,5185941140930560,5872739563339776,6567476964360192,6662379359174656,5477045390802944,5762412339265536,4943277299073024,4934744555388928,6254469468651520,5387803830517760,6690178876833792,5847094594633728,6032094282121216,4534819424829440,5066710952968192,6451011542581248,5588615127105536,5588615127105536,4759189444886528,5234950723338240,6216014958690304,5848753138302976,5848753138302976,6058726826442752,4623301444370432,4904178569183232,6237802009198592,6694542320336896,6347858795036672,4648546157461504,4819203738566656,5450663956840448,5446155391991808]
}

module.exports = config;

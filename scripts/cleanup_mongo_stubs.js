const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://adarshdeepsachan_db_user:NdHS0Wqw3LVkDJS3@trustmygadget.liwngnz.mongodb.net/trustmygadget?retryWrites=true&w=majority&appName=trustmygadget';

async function cleanup() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const stubIds = [
      'm_hp_pavilion_15',
      'm_apple_iphone_13',
      'm_apple_iphone_15',
      'm_apple_iphone_14',
      'm_apple_iphone_15_plus',
      'm_apple_iphone_17_pro',
      'm_apple_iphone_air',
      'm_apple_iphone_16',
      'm_apple_iphone_16_pro',
      'm_apple_iphone_17_pro_max',
      'm_apple_iphone_16_pro_max',
      'm_apple_iphone_16e',
      'm_apple_iphone_16_plus',
      'm_apple_iphone_17',
      'm_motorola_edge_60',
      'm_motorola_edge_60_fusion',
      'm_motorola_edge_60_pro',
      'm_motorola_edge_70_fusion',
      'm_motorola_razr_60',
      'm_motorola_razr_60_ultra',
      'm_samsung_galaxy_a37_5g',
      'm_samsung_galaxy_a56_5g',
      'm_samsung_galaxy_a57_5g',
      'm_samsung_galaxy_a36_5g',
      'm_samsung_galaxy_s24',
      'm_samsung_galaxy_s24_ultra',
      'm_samsung_galaxy_s25_fe',
      'm_samsung_galaxy_s24_plus',
      'm_samsung_galaxy_s26',
      'm_samsung_galaxy_s26_ultra',
      'm_samsung_galaxy_s26_plus',
      'm_xiaomi_redmi_15_5g',
    ];

    const res = await db.collection('models').deleteMany({ id: { $in: stubIds } });
    console.log('Deleted stub duplicate models in MongoDB count:', res.deletedCount);
    const finalModelCount = await db.collection('models').countDocuments();
    const finalVariantCount = await db.collection('variants').countDocuments();
    console.log('Final models count in MongoDB:', finalModelCount);
    console.log('Final variants count in MongoDB:', finalVariantCount);
  } finally {
    await client.close();
  }
}

cleanup().catch(console.error);

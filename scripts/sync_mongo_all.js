const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { MongoClient } = require('mongodb');

async function syncAll() {
  const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
  let mongoUri = '';
  for (const line of envContent.split('\n')) {
    if (line.trim().startsWith('MONGODB_URI=')) {
      mongoUri = line.trim().slice('MONGODB_URI='.length).replace(/^['"]|['"]$/g, '');
    }
  }
  if (!mongoUri) {
    mongoUri = 'mongodb+srv://adarshdeepsachan_db_user:NdHS0Wqw3LVkDJS3@trustmygadget.liwngnz.mongodb.net/trustmygadget?retryWrites=true&w=majority&appName=trustmygadget';
  }

  const sqlite = new Database(path.resolve(__dirname, '../trustmygadget.db'));

  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();

  console.log('Connected!');

  // 1. Check Questions in SQLite
  const sqlQuestions = sqlite.prepare('SELECT * FROM questions').all();
  const getAnswers = sqlite.prepare('SELECT * FROM answers WHERE questionId = ? ORDER BY displayOrder ASC');

  console.log(`SQLite has ${sqlQuestions.length} questions`);

  const questionOps = sqlQuestions.map((q) => {
    const answers = getAnswers.all(q.id).map((a) => ({
      id: a.id,
      questionId: q.id,
      code: a.code,
      label: a.label,
      description: a.description || null,
      icon: a.icon || null,
      adjustmentType: a.adjustmentType || 'FIXED',
      adjustmentValue: Number(a.adjustmentValue) || 0,
      isRejection: a.isRejection === 1,
      warningMessage: a.warningMessage || null,
      displayOrder: a.displayOrder || 0,
      isActive: a.isActive === 1,
    }));

    let target = q.targetCategory;
    if (!target || target === 'ALL') {
      if (q.code.startsWith('PHONE_')) target = 'SMARTPHONE';
      else if (q.code.startsWith('LAPTOP_')) target = 'LAPTOP';
      else target = 'ALL';
    }

    return {
      updateOne: {
        filter: { id: q.id },
        update: {
          $set: {
            id: q.id,
            categoryId: q.categoryId || (target === 'SMARTPHONE' ? 'cat_smartphone' : target === 'LAPTOP' ? 'cat_laptop' : null),
            targetCategory: target,
            brandId: q.brandId || null,
            modelId: q.modelId || null,
            title: q.title,
            subtitle: q.subtitle || null,
            code: q.code,
            questionType: q.questionType || 'SINGLE_CHOICE',
            isRequired: q.isRequired === 1,
            displayOrder: q.displayOrder || 0,
            isActive: q.isActive === 1,
            answers,
            updatedAt: new Date(),
          },
        },
        upsert: true,
      },
    };
  });

  if (questionOps.length > 0) {
    const qRes = await db.collection('questions').bulkWrite(questionOps);
    console.log(`Questions written to MongoDB: ${qRes.upsertedCount} inserted, ${qRes.modifiedCount} updated`);
  }

  // 2. Count verification in MongoDB
  const mongoQCount = await db.collection('questions').countDocuments();
  const mongoMCount = await db.collection('models').countDocuments();
  const mongoVCount = await db.collection('variants').countDocuments();
  const mongoBCount = await db.collection('brands').countDocuments();
  const mongoCCount = await db.collection('categories').countDocuments();

  console.log('MongoDB Totals:');
  console.log('- Categories:', mongoCCount);
  console.log('- Brands:', mongoBCount);
  console.log('- Models:', mongoMCount);
  console.log('- Variants:', mongoVCount);
  console.log('- Questions:', mongoQCount);

  await client.close();
  console.log('Sync complete!');
}

syncAll().catch(console.error);

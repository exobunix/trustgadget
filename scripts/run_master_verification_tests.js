/**
 * MASTER VERIFICATION & TEST SUITE FOR TRUSTGADGETMART
 * Runs all unit, integration, formula, targeting, and persistence regression tests.
 */

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const path = require('path');
const Database = require('better-sqlite3');
const { MongoClient } = require('mongodb');

const dbPath = path.resolve(__dirname, '../trustmygadget.db');
const sqlite = new Database(dbPath);

const { isQuestionApplicable, normalizeTargetCategory } = require('../src/lib/question-targeting');
const { calculateValuation } = require('../src/lib/valuation-engine');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    failedTests++;
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('TRUSTGADGETMART - MASTER TEST & VERIFICATION SUITE');
  console.log('================================================================\n');

  // ----------------------------------------------------------------
  // PART A: PRICING FORMULA TESTS
  // ----------------------------------------------------------------
  console.log('--- TEST GROUP 1: Pricing Calculation Formula ---');

  // Setup test model in SQLite
  const testModelId = 'm_test_pricing_unit_model';
  sqlite.prepare(`
    INSERT OR REPLACE INTO models (id, brandId, categoryId, name, slug, basePrice, isActive)
    VALUES (?, 'b_phone_apple', 'cat_smartphone', 'iPhone Test Unit', 'iphone-test-unit', 20000, 1)
  `).run(testModelId);

  // Setup test questions and answers in SQLite
  const testQ1 = 'q_test_battery';
  const testQ2 = 'q_test_display';
  const testQ3 = 'q_test_body';
  const testQ4 = 'q_test_fixed_deduct';
  const testQ5 = 'q_test_reject';

  sqlite.prepare(`INSERT OR REPLACE INTO questions (id, code, title, categoryId, targetCategory, isActive) VALUES (?, 'TEST_BATTERY', 'Battery', 'cat_smartphone', 'SMARTPHONE', 1)`).run(testQ1);
  sqlite.prepare(`INSERT OR REPLACE INTO questions (id, code, title, categoryId, targetCategory, isActive) VALUES (?, 'TEST_DISPLAY', 'Display', 'cat_smartphone', 'SMARTPHONE', 1)`).run(testQ2);
  sqlite.prepare(`INSERT OR REPLACE INTO questions (id, code, title, categoryId, targetCategory, isActive) VALUES (?, 'TEST_BODY', 'Body', 'cat_smartphone', 'SMARTPHONE', 1)`).run(testQ3);
  sqlite.prepare(`INSERT OR REPLACE INTO questions (id, code, title, categoryId, targetCategory, isActive) VALUES (?, 'TEST_FIXED', 'Fixed', 'cat_smartphone', 'SMARTPHONE', 1)`).run(testQ4);
  sqlite.prepare(`INSERT OR REPLACE INTO questions (id, code, title, categoryId, targetCategory, isActive) VALUES (?, 'TEST_REJECT', 'Reject', 'cat_smartphone', 'SMARTPHONE', 1)`).run(testQ5);

  sqlite.prepare(`INSERT OR REPLACE INTO answers (id, questionId, code, label, adjustmentType, adjustmentValue, isActive) VALUES ('a_bat_10', ?, 'B10', 'Battery Issue 10%', 'PERCENTAGE', -10, 1)`).run(testQ1);
  sqlite.prepare(`INSERT OR REPLACE INTO answers (id, questionId, code, label, adjustmentType, adjustmentValue, isActive) VALUES ('a_disp_15', ?, 'D15', 'Display Damage 15%', 'PERCENTAGE', -15, 1)`).run(testQ2);
  sqlite.prepare(`INSERT OR REPLACE INTO answers (id, questionId, code, label, adjustmentType, adjustmentValue, isActive) VALUES ('a_body_5', ?, 'B5', 'Physical Damage 5%', 'PERCENTAGE', -5, 1)`).run(testQ3);
  sqlite.prepare(`INSERT OR REPLACE INTO answers (id, questionId, code, label, adjustmentType, adjustmentValue, isActive) VALUES ('a_fixed_1000', ?, 'F1000', 'Fixed Deduction ₹1,000', 'FIXED', -1000, 1)`).run(testQ4);
  sqlite.prepare(`INSERT OR REPLACE INTO answers (id, questionId, code, label, adjustmentType, adjustmentValue, isRejection, isActive) VALUES ('a_rej', ?, 'REJ', 'Dead Motherboard', 'FIXED', 0, 1, 1)`).run(testQ5);

  // Test 1: No deductions
  const res1 = calculateValuation(testModelId, null, []);
  assert(res1.estimatedPrice === 20000, 'Test 1: No deductions yields exact base price ₹20,000', `Got ${res1.estimatedPrice}`);

  // Test 2: Combined percentage deductions (10% + 15% + 5% = 30% -> ₹6,000 deduction -> ₹14,000 final)
  const res2 = calculateValuation(testModelId, null, [
    { questionCode: 'TEST_BATTERY', answerCode: 'B10' },
    { questionCode: 'TEST_DISPLAY', answerCode: 'D15' },
    { questionCode: 'TEST_BODY', answerCode: 'B5' },
  ]);
  assert(res2.percentageDeductionRate === 30, 'Test 2a: Sum of percentages is 30%', `Got ${res2.percentageDeductionRate}%`);
  assert(res2.percentageDeductionAmount === 6000, 'Test 2b: Percentage deduction amount is ₹6,000', `Got ${res2.percentageDeductionAmount}`);
  assert(res2.estimatedPrice === 14000, 'Test 2c: Final price is ₹14,000', `Got ${res2.estimatedPrice}`);

  // Test 3: Combined percentages (30%) plus fixed deduction (₹1,000) -> Total deductions = ₹7,000 -> Final = ₹13,000
  const res3 = calculateValuation(testModelId, null, [
    { questionCode: 'TEST_BATTERY', answerCode: 'B10' },
    { questionCode: 'TEST_DISPLAY', answerCode: 'D15' },
    { questionCode: 'TEST_BODY', answerCode: 'B5' },
    { questionCode: 'TEST_FIXED', answerCode: 'F1000' },
  ]);
  assert(res3.totalDeductions === 7000, 'Test 3a: Combined percentage + fixed deductions total ₹7,000', `Got ${res3.totalDeductions}`);
  assert(res3.estimatedPrice === 13000, 'Test 3b: Final price is ₹13,000', `Got ${res3.estimatedPrice}`);

  // Test 4: Legacy negative percentages (-10, -15, -5) normalized to positive deduction rate (30%)
  assert(res2.percentageDeductionRate === 30, 'Test 4: Legacy negative values correctly normalized to 30% without double-negation');

  // Test 5: Multiple percentages on ₹10,000: 20% + 20% -> 40% (₹4,000 deduction) -> ₹6,000 final
  // (NOT calculated progressively which would yield ₹6,400)
  sqlite.prepare(`
    INSERT OR REPLACE INTO models (id, brandId, categoryId, name, slug, basePrice, isActive)
    VALUES ('m_test_10k', 'b_phone_apple', 'cat_smartphone', '10k Unit', '10k-unit', 10000, 1)
  `).run();
  sqlite.prepare(`INSERT OR REPLACE INTO answers (id, questionId, code, label, adjustmentType, adjustmentValue, isActive) VALUES ('a_p20_1', ?, 'P20_1', '20%', 'PERCENTAGE', -20, 1)`).run(testQ1);
  sqlite.prepare(`INSERT OR REPLACE INTO answers (id, questionId, code, label, adjustmentType, adjustmentValue, isActive) VALUES ('a_p20_2', ?, 'P20_2', '20%', 'PERCENTAGE', -20, 1)`).run(testQ2);

  const res5 = calculateValuation('m_test_10k', null, [
    { questionCode: 'TEST_BATTERY', answerCode: 'P20_1' },
    { questionCode: 'TEST_DISPLAY', answerCode: 'P20_2' },
  ]);
  assert(res5.percentageDeductionRate === 40, 'Test 5a: Sum of percentages 20% + 20% = 40%', `Got ${res5.percentageDeductionRate}%`);
  assert(res5.estimatedPrice === 6000, 'Test 5b: Base ₹10,000 - 40% = exactly ₹6,000 (Non-progressive)', `Got ${res5.estimatedPrice}`);

  // Test 6: Rejection condition and Excessive deductions
  const res6Rejection = calculateValuation(testModelId, null, [
    { questionCode: 'TEST_REJECT', answerCode: 'REJ' },
  ]);
  assert(res6Rejection.isRejected === true, 'Test 6a: Device marked as rejected');
  assert(res6Rejection.estimatedPrice === 0, 'Test 6b: Rejected device final price is ₹0');

  // Test 6c: Deductions exceeding base price floor at ₹0
  sqlite.prepare(`INSERT OR REPLACE INTO answers (id, questionId, code, label, adjustmentType, adjustmentValue, isActive) VALUES ('a_bat_150', ?, 'B150', '150%', 'PERCENTAGE', -150, 1)`).run(testQ1);
  const res6Excessive = calculateValuation(testModelId, null, [
    { questionCode: 'TEST_BATTERY', answerCode: 'B150' },
  ]);
  assert(res6Excessive.estimatedPrice === 0, 'Test 6c: Excessive deductions floor at ₹0 (No negative resale quote)');

  console.log('\n--- TEST GROUP 2: Device Category Targeting Engine ---');
  // Setup devices
  const iphoneDevice = { categoryId: 'cat_smartphone', categorySlug: 'smartphones', brandId: 'b_phone_apple', brandName: 'Apple', modelName: 'iPhone 15 Pro' };
  const samsungDevice = { categoryId: 'cat_smartphone', categorySlug: 'smartphones', brandId: 'b_phone_samsung', brandName: 'Samsung', modelName: 'Galaxy S24 Ultra' };
  const macbookDevice = { categoryId: 'cat_laptop', categorySlug: 'laptops', brandId: 'b_lap_apple', brandName: 'Apple', modelName: 'MacBook Pro 14-inch' };
  const dellDevice = { categoryId: 'cat_laptop', categorySlug: 'laptops', brandId: 'b_lap_dell', brandName: 'Dell', modelName: 'Dell XPS 15' };
  const tabletDevice = { categoryId: 'cat_tablet', categorySlug: 'tablets', brandId: 'b_phone_apple', brandName: 'Apple', modelName: 'iPad Air 5' };

  // Questions
  const qIPhoneOnly = { code: 'IPHONE_BATTERY', targetCategory: 'IPHONE' };
  const qAndroidOnly = { code: 'ANDROID_BATTERY', targetCategory: 'ANDROID_PHONE' };
  const qMacBookOnly = { code: 'MAC_BATTERY', targetCategory: 'MACBOOK' };
  const qWindowsOnly = { code: 'WIN_TRACKPAD', targetCategory: 'WINDOWS_LAPTOP' };
  const qAllPhones = { code: 'PHONE_POWER', targetCategory: 'SMARTPHONE' };
  const qAllLaptops = { code: 'LAPTOP_POWER', targetCategory: 'LAPTOP' };
  const qGeneral = { code: 'GEN_BILL', targetCategory: 'ALL' };

  assert(isQuestionApplicable(qIPhoneOnly, iphoneDevice) === true, 'Test 7a: iPhone-only question appears on iPhone');
  assert(isQuestionApplicable(qIPhoneOnly, samsungDevice) === false, 'Test 7b: iPhone-only question NEVER appears on Samsung phone');
  assert(isQuestionApplicable(qIPhoneOnly, macbookDevice) === false, 'Test 7c: iPhone-only question NEVER appears on MacBook');
  assert(isQuestionApplicable(qIPhoneOnly, dellDevice) === false, 'Test 7d: iPhone-only question NEVER appears on Windows laptop');

  assert(isQuestionApplicable(qAndroidOnly, samsungDevice) === true, 'Test 8a: Android-only question appears on Samsung phone');
  assert(isQuestionApplicable(qAndroidOnly, iphoneDevice) === false, 'Test 8b: Android-only question NEVER appears on iPhone');

  assert(isQuestionApplicable(qMacBookOnly, macbookDevice) === true, 'Test 9a: MacBook-only question appears on MacBook');
  assert(isQuestionApplicable(qMacBookOnly, dellDevice) === false, 'Test 9b: MacBook-only question NEVER appears on Windows laptop');
  assert(isQuestionApplicable(qMacBookOnly, iphoneDevice) === false, 'Test 9c: MacBook-only question NEVER appears on iPhone');

  assert(isQuestionApplicable(qWindowsOnly, dellDevice) === true, 'Test 10a: Windows laptop question appears on Dell laptop');
  assert(isQuestionApplicable(qWindowsOnly, macbookDevice) === false, 'Test 10b: Windows laptop question NEVER appears on MacBook');

  assert(isQuestionApplicable(qAllPhones, iphoneDevice) === true, 'Test 11a: Smartphone question appears on iPhone');
  assert(isQuestionApplicable(qAllPhones, samsungDevice) === true, 'Test 11b: Smartphone question appears on Samsung');
  assert(isQuestionApplicable(qAllPhones, dellDevice) === false, 'Test 11c: Smartphone question NEVER appears on Laptop');

  assert(isQuestionApplicable(qAllLaptops, dellDevice) === true, 'Test 12a: Laptop question appears on Dell');
  assert(isQuestionApplicable(qAllLaptops, macbookDevice) === true, 'Test 12b: Laptop question appears on MacBook');
  assert(isQuestionApplicable(qAllLaptops, samsungDevice) === false, 'Test 12c: Laptop question NEVER appears on Smartphone');

  console.log('\n--- TEST GROUP 3: Database & Catalog Counts Reconciliation ---');
  const countModels = sqlite.prepare('SELECT count(*) c FROM models WHERE isActive = 1').get().c;
  const countVariants = sqlite.prepare('SELECT count(*) c FROM variants WHERE isActive = 1').get().c;
  const countBrands = sqlite.prepare('SELECT count(*) c FROM brands WHERE isActive = 1').get().c;
  const countCategories = sqlite.prepare('SELECT count(*) c FROM categories WHERE isActive = 1').get().c;

  assert(countModels >= 2364, `Test 13a: Total model series reconciled (Found: ${countModels})`);
  assert(countVariants >= 3358, `Test 13b: Total hardware variants reconciled (Found: ${countVariants})`);
  assert(countBrands === 67, `Test 13c: Total brands is exactly 67 (Found: ${countBrands})`);
  assert(countCategories === 3, `Test 13d: Total categories is 3 (Found: ${countCategories})`);

  console.log('\n--- TEST GROUP 4: MongoDB Atlas Persistence Integration ---');
  const uri = process.env.MONGODB_URI || 'mongodb+srv://adarshdeepsachan_db_user:NdHS0Wqw3LVkDJS3@trustmygadget.liwngnz.mongodb.net/trustmygadget?retryWrites=true&w=majority&appName=trustmygadget';
  const mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  const mongoDb = mongoClient.db();

  const mongoQuestionsCount = await mongoDb.collection('questions').countDocuments();
  assert(mongoQuestionsCount >= 15, `Test 14a: MongoDB Questions collection active (Count: ${mongoQuestionsCount})`);

  // Test question CRUD persistence in MongoDB
  const testMongoQId = `q_test_perm_${Date.now()}`;
  await mongoDb.collection('questions').insertOne({
    id: testMongoQId,
    title: 'Persistent Integration Test Question',
    targetCategory: 'IPHONE',
    code: 'TEST_PERM_CODE',
    answers: [
      { id: 'ans_perm_1', code: 'YES', label: 'Yes', adjustmentType: 'FIXED', adjustmentValue: 0 },
      { id: 'ans_perm_2', code: 'NO', label: 'No', adjustmentType: 'PERCENTAGE', adjustmentValue: -15 },
    ],
  });

  const fetchedQ = await mongoDb.collection('questions').findOne({ id: testMongoQId });
  assert(fetchedQ !== null, 'Test 14b: Created question retrieved from MongoDB');
  assert(fetchedQ.targetCategory === 'IPHONE', 'Test 14c: Saved targetCategory is preserved in MongoDB');
  assert(fetchedQ.answers.length === 2, 'Test 14d: Saved answers are preserved in MongoDB');

  // Update targetCategory and answers
  await mongoDb.collection('questions').updateOne(
    { id: testMongoQId },
    { $set: { targetCategory: 'MACBOOK', title: 'Updated Persistent Title' } }
  );
  const updatedQ = await mongoDb.collection('questions').findOne({ id: testMongoQId });
  assert(updatedQ.targetCategory === 'MACBOOK', 'Test 14e: Updated targetCategory preserved in MongoDB');
  assert(updatedQ.title === 'Updated Persistent Title', 'Test 14f: Updated title preserved in MongoDB');

  // Delete test question
  await mongoDb.collection('questions').deleteOne({ id: testMongoQId });
  const deletedQ = await mongoDb.collection('questions').findOne({ id: testMongoQId });
  assert(deletedQ === null, 'Test 14g: Deleted question stays deleted in MongoDB');

  await mongoClient.close();

  // Cleanup test models from SQLite
  sqlite.prepare(`DELETE FROM models WHERE id IN ('${testModelId}', 'm_test_10k')`).run();
  sqlite.prepare(`DELETE FROM questions WHERE id IN ('${testQ1}', '${testQ2}', '${testQ3}', '${testQ4}', '${testQ5}')`).run();
  sqlite.prepare(`DELETE FROM answers WHERE questionId IN ('${testQ1}', '${testQ2}', '${testQ3}', '${testQ4}', '${testQ5}')`).run();

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

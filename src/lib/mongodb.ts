import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import dns from 'dns';

try {
  if (typeof dns.setServers === 'function') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  }
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adarshdeepsachan_db_user:NdHS0Wqw3LVkDJS3@trustmygadget.liwngnz.mongodb.net/trustmygadget?retryWrites=true&w=majority&appName=trustmygadget';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB with Mongoose
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('MongoDB connected successfully to TrustMyGadget database');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.warn('MongoDB connection attempt failed or username placeholder present:', e);
    throw e;
  }

  return cached.conn;
}

/**
 * Native MongoClient instance
 */
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export { clientPromise };

/* -------------------------------------------------------------
 * MONGOOSE SCHEMAS & MODELS
 * ------------------------------------------------------------- */

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: 'Smartphone' },
  description: { type: String },
  imageUrl: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const BrandSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  logoUrl: { type: String },
  isPopular: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ModelSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  brandId: { type: String, required: true },
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  series: { type: String },
  imageUrl: { type: String },
  releaseYear: { type: Number, default: 2024 },
  basePrice: { type: Number, required: true },
  minPrice: { type: Number },
  maxPrice: { type: Number },
  isPopular: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  specifications: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const VariantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  modelId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  ram: { type: String },
  storage: { type: String },
  processor: { type: String },
  gpu: { type: String },
  screenSize: { type: String },
  color: { type: String },
  basePrice: { type: Number, required: true },
  minPrice: { type: Number },
  maxPrice: { type: Number },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const StatusHistorySubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  orderId: { type: String },
  status: { type: String, required: true },
  note: { type: String },
  changedBy: { type: String, default: 'System' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { _id: false });

const VerificationRecordSubSchema = new mongoose.Schema({
  id: { type: String },
  orderId: { type: String },
  verifiedBy: { type: String },
  declaredCondition: { type: mongoose.Schema.Types.Mixed },
  verifiedCondition: { type: mongoose.Schema.Types.Mixed },
  priceDelta: { type: Number, default: 0 },
  adjustmentsApplied: { type: mongoose.Schema.Types.Mixed },
  inspectionNotes: { type: String },
  inspectionPhotos: [{ type: String }],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: String },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  categoryName: { type: String, required: true },
  brandName: { type: String, required: true },
  modelName: { type: String, required: true },
  variantName: { type: String, required: true },
  deviceImageUrl: { type: String },
  basePrice: { type: Number, required: true },
  estimatedPrice: { type: Number, required: true },
  finalVerifiedPrice: { type: Number },
  status: { type: String, default: 'ORDER_PLACED' },
  paymentStatus: { type: String, default: 'PENDING' },
  payoutMethod: { type: String, default: 'UPI' },
  payoutUpiId: { type: String },
  payoutBankAccount: { type: String },
  payoutBankIfsc: { type: String },
  payoutBankName: { type: String },
  pickupDate: { type: String, required: true },
  pickupTimeSlot: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  pickupCity: { type: String, required: true },
  pickupState: { type: String, required: true },
  pickupPincode: { type: String, required: true },
  pickupLandmark: { type: String },
  pickupNotes: { type: String },
  assignedAgent: { type: String },
  verificationNotes: { type: String },
  cancellationReason: { type: String },
  conditionSummary: { type: mongoose.Schema.Types.Mixed },
  consentGiven: { type: Number, default: 1 },
  consentText: { type: String },
  consentTimestamp: { type: String },
  consentIp: { type: String },
  userAgent: { type: String },
  statusHistory: [StatusHistorySubSchema],
  verificationRecord: VerificationRecordSubSchema,
}, { timestamps: true });

const SupportTicketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ticketNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  orderNumber: { type: String },
  subject: { type: String, required: true },
  status: { type: String, default: 'OPEN' },
  priority: { type: String, default: 'MEDIUM' },
}, { timestamps: true });

const CouponSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  discountType: { type: String, default: 'FIXED' },
  discountValue: { type: Number, required: true },
  minDeviceValue: { type: Number, default: 0 },
  maxBonus: { type: Number },
  expiryDate: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const MongoCategory = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const MongoBrand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
export const MongoModel = mongoose.models.Model || mongoose.model('Model', ModelSchema);
export const MongoVariant = mongoose.models.Variant || mongoose.model('Variant', VariantSchema);
export const MongoOrder = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const MongoSupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);
export const MongoCoupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

/* -------------------------------------------------------------
 * QUESTION & PRICING RULE SCHEMAS (Persistent MongoDB Source of Truth)
 * ------------------------------------------------------------- */

const AnswerSubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  questionId: { type: String },
  code: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  adjustmentType: { type: String, default: 'FIXED' },
  adjustmentValue: { type: Number, default: 0 },
  isRejection: { type: Boolean, default: false },
  warningMessage: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  categoryId: { type: String },
  targetCategory: { type: String, default: 'ALL' },
  brandId: { type: String },
  modelId: { type: String },
  title: { type: String, required: true },
  subtitle: { type: String },
  code: { type: String, required: true, unique: true },
  questionType: { type: String, default: 'SINGLE_CHOICE' },
  isRequired: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  answers: [AnswerSubSchema],
}, { timestamps: true });

const PricingRuleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  categoryId: { type: String },
  targetCategory: { type: String, default: 'ALL' },
  brandId: { type: String },
  modelId: { type: String },
  variantId: { type: String },
  questionCode: { type: String },
  answerCode: { type: String },
  ruleType: { type: String, default: 'DEDUCTION' },
  adjustmentType: { type: String, default: 'FIXED' },
  adjustmentValue: { type: Number, default: 0 },
  priorityLevel: { type: String, default: 'GLOBAL' },
  maxCap: { type: Number },
  minCap: { type: Number },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const MongoQuestion = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
export const MongoPricingRule = mongoose.models.PricingRule || mongoose.model('PricingRule', PricingRuleSchema);


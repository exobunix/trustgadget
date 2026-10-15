/**
 * Centralized device-question compatibility engine for TrustGadgetMart.
 * Evaluates whether a question or pricing adjustment is applicable to a specific device.
 */

export const TARGET_CATEGORIES = {
  ALL: 'ALL',                         // All Supported Devices
  SMARTPHONE: 'SMARTPHONE',           // All Smartphones
  IPHONE: 'IPHONE',                   // iPhone / Apple iPhone
  ANDROID_PHONE: 'ANDROID_PHONE',     // Android Phones
  LAPTOP: 'LAPTOP',                   // All Laptops
  MACBOOK: 'MACBOOK',                 // MacBook / Apple Mac
  WINDOWS_LAPTOP: 'WINDOWS_LAPTOP',   // Windows Laptops
  OTHER_LAPTOP: 'OTHER_LAPTOP',       // Other Supported Laptops
  TABLET: 'TABLET',                   // Tablets
} as const;

export type TargetCategoryType = keyof typeof TARGET_CATEGORIES | string;

export interface DeviceContext {
  categoryId?: string | null;      // 'cat_smartphone' | 'cat_laptop' | 'cat_tablet'
  categorySlug?: string | null;    // 'smartphones' | 'laptops' | 'tablets'
  brandId?: string | null;        // 'b_phone_apple', 'b_phone_samsung', 'b_lap_apple', 'b_lap_dell', etc.
  brandName?: string | null;      // 'Apple', 'Samsung', 'Dell', etc.
  modelId?: string | null;        // 'm_apple_iphone_15_pro'
  modelName?: string | null;      // 'iPhone 15 Pro', 'MacBook Pro'
  series?: string | null;
}

export interface QuestionTargetLike {
  id?: string;
  code?: string;
  title?: string;
  categoryId?: string | null;
  targetCategory?: string | null;
  brandId?: string | null;
  modelId?: string | null;
}

/**
 * Normalizes question target category string to standardized uppercase key.
 */
export function normalizeTargetCategory(rawTarget?: string | null, categoryId?: string | null, code?: string): string {
  if (rawTarget && rawTarget.trim()) {
    const upper = rawTarget.trim().toUpperCase();
    if (upper === 'CAT_SMARTPHONE' || upper === 'SMARTPHONES' || upper === 'SMARTPHONE') return 'SMARTPHONE';
    if (upper === 'CAT_LAPTOP' || upper === 'LAPTOPS' || upper === 'LAPTOP') return 'LAPTOP';
    if (upper === 'CAT_TABLET' || upper === 'TABLETS' || upper === 'TABLET') return 'TABLET';
    if (upper === 'IPHONE' || upper === 'APPLE_IPHONE' || upper === 'TARGET_IPHONE') return 'IPHONE';
    if (upper === 'ANDROID_PHONE' || upper === 'ANDROID' || upper === 'TARGET_ANDROID') return 'ANDROID_PHONE';
    if (upper === 'MACBOOK' || upper === 'APPLE_MAC' || upper === 'TARGET_MACBOOK') return 'MACBOOK';
    if (upper === 'WINDOWS_LAPTOP' || upper === 'WINDOWS' || upper === 'TARGET_WINDOWS_LAPTOP') return 'WINDOWS_LAPTOP';
    if (upper === 'OTHER_LAPTOP' || upper === 'TARGET_OTHER_LAPTOP') return 'OTHER_LAPTOP';
    if (upper === 'ALL' || upper === 'ALL_DEVICES' || upper === 'GENERAL') return 'ALL';
    return upper;
  }

  // Infer from categoryId if targetCategory is empty
  if (categoryId === 'cat_smartphone') return 'SMARTPHONE';
  if (categoryId === 'cat_laptop') return 'LAPTOP';
  if (categoryId === 'cat_tablet') return 'TABLET';

  // Infer from question code prefix if available
  if (code?.startsWith('PHONE_')) return 'SMARTPHONE';
  if (code?.startsWith('LAPTOP_')) return 'LAPTOP';

  return 'ALL';
}

/**
 * Centralized applicability check:
 * Determines if a given question is applicable to a specific device.
 */
export function isQuestionApplicable(question: QuestionTargetLike, device: DeviceContext): boolean {
  // 1. Explicit model restriction
  if (question.modelId && device.modelId && question.modelId !== device.modelId) {
    return false;
  }

  // 2. Explicit brand restriction
  if (question.brandId && device.brandId && question.brandId !== device.brandId) {
    return false;
  }

  const target = normalizeTargetCategory(question.targetCategory, question.categoryId, question.code);

  const isSmartphone =
    device.categoryId === 'cat_smartphone' ||
    device.categoryId === 'smartphones' ||
    device.categorySlug === 'smartphones';
  const isLaptop =
    device.categoryId === 'cat_laptop' ||
    device.categoryId === 'laptops' ||
    device.categorySlug === 'laptops';
  const isTablet =
    device.categoryId === 'cat_tablet' ||
    device.categoryId === 'tablets' ||
    device.categorySlug === 'tablets';

  const brandName = (device.brandName || '').toLowerCase();
  const brandId = (device.brandId || '').toLowerCase();
  const modelName = (device.modelName || '').toLowerCase();

  const isApple =
    brandName === 'apple' ||
    brandId.includes('apple') ||
    modelName.startsWith('iphone') ||
    modelName.startsWith('macbook') ||
    modelName.startsWith('ipad');

  const isIPhone = isSmartphone && isApple;
  const isAndroid = isSmartphone && !isApple;
  const isMacBook = isLaptop && isApple;
  const isWindowsLaptop = isLaptop && !isApple;

  switch (target) {
    case 'ALL':
      // General question: if it starts with PHONE_ it shouldn't be shown to laptops, if LAPTOP_ not to phones
      if (question.code?.startsWith('PHONE_') && !isSmartphone) return false;
      if (question.code?.startsWith('LAPTOP_') && !isLaptop) return false;
      return true;

    case 'SMARTPHONE':
      return isSmartphone;

    case 'IPHONE':
      return isIPhone;

    case 'ANDROID_PHONE':
      return isAndroid;

    case 'LAPTOP':
      return isLaptop;

    case 'MACBOOK':
      return isMacBook;

    case 'WINDOWS_LAPTOP':
      return isWindowsLaptop;

    case 'OTHER_LAPTOP':
      return isLaptop && !isMacBook;

    case 'TABLET':
      return isTablet;

    default:
      if (question.categoryId && device.categoryId && question.categoryId !== device.categoryId) {
        return false;
      }
      return true;
  }
}

/**
 * Determines whether a question allows multiple choices / simultaneous selections.
 */
export function isMultiChoiceQuestion(question: any): boolean {
  if (!question) return false;
  const qType = (question.questionType || '').toUpperCase();
  if (qType === 'MULTI_CHOICE' || qType === 'MULTI' || qType === 'CHECKBOX') {
    return true;
  }
  const code = (question.code || '').toUpperCase();
  const title = (question.title || '').toLowerCase();
  const subtitle = (question.subtitle || '').toLowerCase();

  return (
    code.includes('FUNCTIONAL') ||
    code.includes('PHYSICAL') ||
    code.includes('CONDITION') ||
    code.includes('BODY') ||
    code.includes('SCREEN') ||
    code.includes('GLASS') ||
    code.includes('DAMAGE') ||
    code.includes('DEFECT') ||
    code.includes('ISSUES') ||
    code.includes('PROBLEMS') ||
    code.includes('ACCESSORIES') ||
    title.includes('select all') ||
    subtitle.includes('select all') ||
    title.includes('physical') ||
    subtitle.includes('physical') ||
    title.includes('condition') ||
    subtitle.includes('condition') ||
    title.includes('functional') ||
    subtitle.includes('functional') ||
    title.includes('problems') ||
    subtitle.includes('problems') ||
    title.includes('issues') ||
    subtitle.includes('issues') ||
    title.includes('defects') ||
    subtitle.includes('defects') ||
    title.includes('screen') ||
    title.includes('body') ||
    title.includes('accessories') ||
    subtitle.includes('accessories')
  );
}

/**
 * Determines whether a specific answer option represents an exclusive "No Defect / Flawless / All Original / None" choice.
 * When selected in a multi-choice question, it unselects all defect choices.
 * Conversely, selecting any defect choice unselects this choice.
 */
export function isExclusiveNoDefectAnswer(ans: { code?: string; label?: string } | null | undefined): boolean {
  if (!ans) return false;
  const label = (ans.label || '').toLowerCase().trim();
  const code = (ans.code || '').toUpperCase().trim();

  // 1. Explicit no-defect statements take highest precedence
  const isExplicitNoDefect =
    label.includes('no physical defect') ||
    label.includes('no physical damage') ||
    label.includes('no defect') ||
    label.includes('no issue') ||
    label.includes('no problem') ||
    label.includes('no scratch') ||
    label.includes('no damage') ||
    label.includes('none of the') ||
    label === 'none' ||
    label.includes('flawless') ||
    label.includes('works perfectly') ||
    label.includes('boots up perfectly') ||
    label.includes('all working') ||
    label.includes('all original') ||
    label.includes('all functional') ||
    label.includes('pristine');

  if (isExplicitNoDefect) {
    return true;
  }

  // 2. If the label contains problem/defect keywords, it CAN NEVER be an exclusive no-defect choice
  const defectWords = [
    'broken',
    'cracked',
    'crack',
    'scratch',
    'dent',
    'bend',
    'damage',
    'fault',
    'issue',
    'problem',
    'missing',
    'not working',
    'not responding',
    'cannot',
    'drain',
    'line',
    'spot',
    'bleed',
    'replaced',
    'defective',
    'dead',
    'failed',
    'blur',
    'locked',
  ];

  for (const word of defectWords) {
    if (label.includes(word)) {
      return false;
    }
  }

  // 3. Fallback to code only if label does not describe an option/defect
  if (
    code === 'NO_DEFECTS' ||
    code === 'NO_DEFECT' ||
    code === 'NONE' ||
    code === 'ALL_GOOD' ||
    code === 'ALL_FUNCTIONAL'
  ) {
    return true;
  }

  // If code is PERFECT or FLAWLESS, only consider it no-defect if label is empty or explicitly positive
  if (code === 'PERFECT' || code === 'FLAWLESS') {
    if (!label || label.includes('perfect') || label.includes('flawless') || label.includes('good')) {
      return true;
    }
  }

  return false;
}


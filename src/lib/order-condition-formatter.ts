import { db } from './db';

export interface FormattedConditionItem {
  questionCode: string;
  questionTitle: string;
  selectedCodes: string[];
  selectedLabels: string[];
}

const QUESTION_CODE_TITLE_MAP: Record<string, string> = {
  PHONE_FUNCTIONAL_ISSUES: 'Functional Issues',
  PHONE_PHYSICAL_CONDITION: 'Physical Condition',
  SMARTPHONE_AGE: 'Smartphone Age',
  SMARTPHONE_ACCESSORIES: 'Accessories',
  PHONE_POWER: 'Power & Boot Status',
  PHONE_DISPLAY_TOUCH: 'Touchscreen & Display Functionality',
  PHONE_SCREEN_GLASS: 'Physical Screen Glass Condition',
  PHONE_BODY: 'Body, Frame & Back Panel Condition',
  PHONE_CAMERAS: 'Cameras Functionality',
  PHONE_BIOMETRICS: 'Biometrics (Face ID / Fingerprint)',
  PHONE_BATTERY: 'Battery Health & Charging Port',
  PHONE_LOCKS: 'Account Locks (iCloud / Google FRP / MDM)',
  PHONE_ACCESSORIES: 'Original Box, Bill & Charger',
  LAPTOP_POWER: 'Laptop Power & Boot Status',
  LAPTOP_SCREEN: 'Laptop Screen & Hinge Condition',
  LAPTOP_KEYBOARD_TRACKPAD: 'Keyboard, Trackpad & Ports',
  LAPTOP_BATTERY: 'Laptop Battery Health & Backup',
  LAPTOP_BODY: 'Chassis & Outer Shell Condition',
  LAPTOP_ACCESSORIES: 'Original Charger & Accessories',
};

const ANSWER_CODE_LABEL_MAP: Record<string, string> = {
  PERFECT: 'Flawless (No Defects / Issues)',
  FLAWLESS: 'Flawless / Pristine Condition',
  NO_DEFECTS: 'The phone has no physical defects',
  YES: 'Yes, boots up perfectly',
  NO: 'No, does not turn on (Dead)',
  ALL_FUNCTIONAL: 'All Keys & Ports Work 100%',
  WORKING: 'Face ID / Fingerprint Works Perfectly',
  FAILED: 'Biometrics Defective / Disabled',
  HEALTHY: 'Healthy Battery (>85% health / 3+ Hours)',
  MODERATE: 'Moderate Backup (1 to 2 Hours / 75%-84%)',
  DEAD_ONLY_CHARGER: 'Dead Battery (Works Only When Plugged In)',
  POOR: 'Service Recommended (<75% Battery Health)',
  BOX_BILL_CHARGER: 'All Original (Box + Bill + Charger)',
  BILL_AND_BOX: 'Original Bill & Box only',
  BOX_ONLY: 'Original Box Only',
  DEVICE_ONLY: 'Device Only (No Box or Bill)',
  MINOR_ISSUE: 'Minor Touch Lag or Minor Spot',
  LINES_OR_BLEED: 'Display Lines / Screen Bleeding / Green Line',
  NOT_WORKING: 'Touch Not Working / Black Screen',
  MINOR_SCRATCHES: 'Minor Hairline Scratches',
  HEAVY_SCRATCHES: 'Deep Scratches',
  CRACKED: 'Cracked Front Glass / Screen',
  MINOR_SCUFFS: 'Minor Scuffs / Case Marks',
  DENTS_OR_BENT: 'Dents on Frame or Bent Body',
  CRACKED_BACK: 'Cracked / Shattered Back Glass',
  BLUR_OR_DUST: 'Minor Blur / Dust inside Lens',
  CAMERA_DEFECTIVE: 'One or More Cameras Not Working',
  NO_LOCKS: 'Clean Device (No Account Lock)',
  LOCKED: 'Locked with Forgotten Password / MDM Lock',
  FEW_KEYS_OR_PORT_DEFECT: '1-3 Defective Keys or Broken USB Port',
  KEYBOARD_TRACKPAD_FAILED: 'Keyboard / Trackpad Non-Functional',
  KEYBOARD_MARKS: 'Minor Keyboard Marks on Coating',
  LINES_OR_WHITE_SPOTS: 'White Pressure Spots or Vertical Lines',
  CRACKED_OR_BROKEN_HINGE: 'Cracked Screen or Broken Hinge',
};

export function cleanCodeTitle(code: string): string {
  if (QUESTION_CODE_TITLE_MAP[code]) return QUESTION_CODE_TITLE_MAP[code];
  return code
    .replace(/^PHONE_/, '')
    .replace(/^LAPTOP_/, '')
    .replace(/^SMARTPHONE_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function cleanCodeLabel(code: string): string {
  if (ANSWER_CODE_LABEL_MAP[code]) return ANSWER_CODE_LABEL_MAP[code];
  if (code.startsWith('OPT_')) {
    return code;
  }
  return code
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Universal resolver that formats any conditionSummary format into human-readable question & answer items.
 * Can be called with SQLite db or questions catalog for authoritative labels.
 */
export function resolveOrderConditions(
  conditionSummaryRaw: any,
  lookupDb?: any
): FormattedConditionItem[] {
  if (!conditionSummaryRaw) return [];

  let data: any = conditionSummaryRaw;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return [{
        questionCode: 'SUMMARY',
        questionTitle: 'Diagnostic Summary',
        selectedCodes: [],
        selectedLabels: [String(data)],
      }];
    }
  }

  // If already formatted as enriched items
  if (Array.isArray(data)) {
    // Check if it's already { questionTitle, selectedLabels }
    if (data.length > 0 && (data[0].selectedLabels || data[0].questionTitle)) {
      return data.map((item: any) => ({
        questionCode: item.questionCode || '',
        questionTitle: item.questionTitle || cleanCodeTitle(item.questionCode || 'Condition'),
        selectedCodes: item.selectedCodes || [],
        selectedLabels: item.selectedLabels || item.selectedCodes?.map((c: string) => cleanCodeLabel(c)) || [],
      }));
    }

    // Check if it's [{ questionCode, answerCode }]
    if (data.length > 0 && data[0].questionCode && data[0].answerCode) {
      const grouped: Record<string, string[]> = {};
      data.forEach((entry: any) => {
        if (!grouped[entry.questionCode]) grouped[entry.questionCode] = [];
        grouped[entry.questionCode].push(entry.answerCode);
      });
      data = grouped;
    }
  }

  if (typeof data !== 'object' || data === null) {
    return [];
  }

  const activeDb = lookupDb || db;
  let allQuestions: any[] = [];
  let allAnswers: any[] = [];
  try {
    if (activeDb && typeof activeDb.prepare === 'function') {
      allQuestions = activeDb.prepare('SELECT id, code, title FROM questions').all() || [];
      allAnswers = activeDb.prepare('SELECT id, questionId, code, label, description FROM answers').all() || [];
    }
  } catch (e) {
    // Fallback to static dictionary if db fails
  }

  const qByCode = new Map<string, any>();
  const qById = new Map<string, any>();
  allQuestions.forEach((q) => {
    if (q.code) qByCode.set(q.code, q);
    if (q.id) qById.set(q.id, q);
  });

  const aByCode = new Map<string, any>();
  allAnswers.forEach((a) => {
    if (a.code && !aByCode.has(a.code)) aByCode.set(a.code, a);
    if (a.id && !aByCode.has(a.id)) aByCode.set(a.id, a);
  });

  const result: FormattedConditionItem[] = [];

  for (const [qKey, val] of Object.entries(data)) {
    // Determine Question Title
    const matchedQ = qByCode.get(qKey) || qById.get(qKey);
    const questionTitle = matchedQ?.title || cleanCodeTitle(qKey);

    const codes: string[] = Array.isArray(val)
      ? val.map(String)
      : typeof val === 'string'
      ? val.split(',').map((s) => s.trim()).filter(Boolean)
      : [String(val)];

    const selectedLabels: string[] = codes.map((c) => {
      // 1. Look up answer in DB
      const matchedAns = aByCode.get(c);
      if (matchedAns && matchedAns.label) {
        return matchedAns.label;
      }

      // 2. Look up in static dictionary
      if (ANSWER_CODE_LABEL_MAP[c]) {
        return ANSWER_CODE_LABEL_MAP[c];
      }

      // 3. Fallback clean label
      return cleanCodeLabel(c);
    });

    result.push({
      questionCode: qKey,
      questionTitle,
      selectedCodes: codes,
      selectedLabels,
    });
  }

  return result;
}

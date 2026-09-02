import { db } from './db';

export interface AnswerSelection {
  questionCode: string;
  answerCode: string;
  customValue?: string;
}

export interface ValuationAdjustment {
  questionTitle: string;
  answerLabel: string;
  type: 'ADDITION' | 'DEDUCTION' | 'NEUTRAL';
  adjustmentType: 'FIXED' | 'PERCENTAGE';
  adjustmentValue: number;
  calculatedAmount: number;
  reason: string;
  isRejection?: boolean;
}

export interface ValuationResult {
  basePrice: number;
  estimatedPrice: number;
  totalAdditions: number;
  totalDeductions: number;
  adjustments: ValuationAdjustment[];
  isRejected: boolean;
  rejectionReason: string | null;
  ruleAuditLog: string[];
}

export function calculateValuation(
  modelId: string,
  variantId: string | null,
  answers: AnswerSelection[]
): ValuationResult {
  // 1. Fetch Model & Variant
  const model = db.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
  if (!model) {
    throw new Error(`Model with id ${modelId} not found`);
  }

  let basePrice = model.basePrice;
  let variant: any = null;

  if (variantId) {
    variant = db.prepare('SELECT * FROM variants WHERE id = ?').get(variantId) as any;
    if (variant && variant.basePrice) {
      basePrice = variant.basePrice;
    }
  }

  // 2. Fetch Questions and Answers matching the answers submitted
  const adjustments: ValuationAdjustment[] = [];
  const ruleAuditLog: string[] = [`Base Price for ${model.name} (${variant ? variant.name : 'Default'}): ₹${basePrice.toLocaleString('en-IN')}`];

  let totalAdditions = 0;
  let totalDeductions = 0;
  let isRejected = false;
  let rejectionReason: string | null = null;

  // Fetch all active pricing rules for overriding
  const pricingRules = db.prepare(`
    SELECT * FROM pricing_rules 
    WHERE isActive = 1 
      AND (modelId = ? OR modelId IS NULL)
      AND (brandId = ? OR brandId IS NULL)
      AND (categoryId = ? OR categoryId IS NULL)
  `).all(model.id, model.brandId, model.categoryId) as any[];

  for (const item of answers) {
    // Find Question
    const question = db.prepare('SELECT * FROM questions WHERE code = ?').get(item.questionCode) as any;
    if (!question) continue;

    // Find Answer
    const answer = db.prepare('SELECT * FROM answers WHERE questionId = ? AND code = ?').get(question.id, item.answerCode) as any;
    if (!answer) continue;

    // Check if rejection condition triggered
    if (answer.isRejection) {
      isRejected = true;
      rejectionReason = answer.warningMessage || `Device rejected due to: ${answer.label}`;
      ruleAuditLog.push(`[REJECTION TRIGGERED] ${question.title} -> ${answer.label}`);
    }

    // Check if custom pricing rule overrides this answer
    let adjType: 'FIXED' | 'PERCENTAGE' = answer.adjustmentType;
    let adjValue: number = answer.adjustmentValue;

    // Find highest priority matching rule (Variant > Model > Brand > Category > Global)
    const matchingRule = pricingRules
      .filter(r => (!r.questionCode || r.questionCode === item.questionCode) && (!r.answerCode || r.answerCode === item.answerCode))
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { VARIANT: 5, MODEL: 4, BRAND: 3, CATEGORY: 2, GLOBAL: 1 };
        return (priorityOrder[b.priorityLevel] || 0) - (priorityOrder[a.priorityLevel] || 0);
      })[0];

    if (matchingRule) {
      adjType = matchingRule.adjustmentType;
      adjValue = matchingRule.adjustmentValue;
      ruleAuditLog.push(`[RULE OVERRIDE - ${matchingRule.name}] Applied ${matchingRule.priorityLevel} rule (${adjType} ${adjValue})`);
    }

    // Calculate actual INR amount
    let calculatedAmount = 0;
    if (adjType === 'PERCENTAGE') {
      calculatedAmount = Math.round((basePrice * adjValue) / 100);
    } else {
      calculatedAmount = adjValue;
    }

    let type: 'ADDITION' | 'DEDUCTION' | 'NEUTRAL' = 'NEUTRAL';
    if (calculatedAmount > 0) {
      type = 'ADDITION';
      totalAdditions += calculatedAmount;
      ruleAuditLog.push(`[BONUS +₹${calculatedAmount.toLocaleString('en-IN')}] ${question.title}: ${answer.label}`);
    } else if (calculatedAmount < 0) {
      type = 'DEDUCTION';
      totalDeductions += Math.abs(calculatedAmount);
      ruleAuditLog.push(`[DEDUCTION -₹${Math.abs(calculatedAmount).toLocaleString('en-IN')}] ${question.title}: ${answer.label}`);
    }

    adjustments.push({
      questionTitle: question.title,
      answerLabel: answer.label,
      type,
      adjustmentType: adjType,
      adjustmentValue: adjValue,
      calculatedAmount,
      reason: answer.description || answer.label,
      isRejection: answer.isRejection === 1,
    });
  }

  let estimatedPrice = basePrice + totalAdditions - totalDeductions;
  
  // Enforce realistic bounds
  if (isRejected) {
    estimatedPrice = 0;
  } else {
    // Minimum salvage floor value
    const floorPrice = Math.max(500, Math.round(basePrice * 0.15));
    if (estimatedPrice < floorPrice) {
      estimatedPrice = floorPrice;
      ruleAuditLog.push(`[FLOOR VALUE APPLIED] Price adjusted to minimum salvage threshold of ₹${floorPrice.toLocaleString('en-IN')}`);
    }
  }

  ruleAuditLog.push(`Final Calculated Value: ₹${estimatedPrice.toLocaleString('en-IN')}`);

  return {
    basePrice,
    estimatedPrice,
    totalAdditions,
    totalDeductions,
    adjustments,
    isRejected,
    rejectionReason,
    ruleAuditLog,
  };
}

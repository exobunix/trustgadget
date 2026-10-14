import { db } from './db';
import { isQuestionApplicable } from './question-targeting';

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
  percentageDeductionRate: number;
  percentageDeductionAmount: number;
  fixedDeductionAmount: number;
  adjustments: ValuationAdjustment[];
  isRejected: boolean;
  rejectionReason: string | null;
  ruleAuditLog: string[];
}

/**
 * TrustGadgetMart Standard Pricing Engine
 *
 * FORMULA:
 * Final Price = Base Price - Total Deductions
 * Total Deductions = Percentage Deductions + Fixed Deductions
 * Percentage Deductions = Base Price * (Sum of Selected Deduction Percentages / 100)
 *
 * All selected percentage deductions are summed together first and applied
 * to the original base price exactly once.
 */
export function calculateValuation(
  modelId: string,
  variantId: string | null,
  answers: AnswerSelection[]
): ValuationResult {
  // 1. Fetch Model & Variant
  const model = db.prepare('SELECT m.*, b.name as brandName FROM models m LEFT JOIN brands b ON m.brandId = b.id WHERE m.id = ?').get(modelId) as any;
  if (!model) {
    throw new Error(`Model with id ${modelId} not found`);
  }

  let basePrice = Number(model.basePrice) || 0;
  let variant: any = null;

  if (variantId && variantId !== 'DEFAULT') {
    variant = db.prepare('SELECT * FROM variants WHERE id = ?').get(variantId) as any;
    if (variant && variant.basePrice) {
      basePrice = Number(variant.basePrice) || basePrice;
    }
  }

  const deviceContext = {
    categoryId: model.categoryId,
    brandId: model.brandId,
    brandName: model.brandName,
    modelId: model.id,
    modelName: model.name,
    series: model.series,
  };

  const ruleAuditLog: string[] = [
    `Base Price for ${model.name} (${variant ? variant.name : 'Standard'}): ₹${basePrice.toLocaleString('en-IN')}`,
  ];

  let isRejected = false;
  let rejectionReason: string | null = null;

  // Active pricing rules for overriding answers
  const pricingRules = db.prepare(`
    SELECT * FROM pricing_rules 
    WHERE isActive = 1 
      AND (modelId = ? OR modelId IS NULL)
      AND (brandId = ? OR brandId IS NULL)
      AND (categoryId = ? OR categoryId IS NULL)
  `).all(model.id, model.brandId, model.categoryId) as any[];

  const adjustments: ValuationAdjustment[] = [];

  let sumPercentageDeductions = 0;
  let sumFixedDeductions = 0;
  let sumAdditions = 0;

  for (const item of answers) {
    // Find Question
    const question = db.prepare('SELECT * FROM questions WHERE code = ?').get(item.questionCode) as any;
    if (!question) continue;

    // Verify question is applicable to this device
    if (!isQuestionApplicable(question, deviceContext)) {
      ruleAuditLog.push(`[SKIPPED - INCOMPATIBLE] Question "${question.title}" (${question.code}) does not apply to this device`);
      continue;
    }

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
    let adjType: 'FIXED' | 'PERCENTAGE' = answer.adjustmentType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED';
    let rawValue: number = Number(answer.adjustmentValue) || 0;
    let ruleType: 'DEDUCTION' | 'ADDITION' = 'DEDUCTION';

    // Find highest priority matching rule
    const matchingRule = pricingRules
      .filter((r) => (!r.questionCode || r.questionCode === item.questionCode) && (!r.answerCode || r.answerCode === item.answerCode))
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { VARIANT: 5, MODEL: 4, BRAND: 3, CATEGORY: 2, GLOBAL: 1 };
        return (priorityOrder[b.priorityLevel] || 0) - (priorityOrder[a.priorityLevel] || 0);
      })[0];

    if (matchingRule) {
      adjType = matchingRule.adjustmentType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED';
      rawValue = Number(matchingRule.adjustmentValue) || 0;
      ruleType = matchingRule.ruleType === 'ADDITION' ? 'ADDITION' : 'DEDUCTION';
      ruleAuditLog.push(`[RULE OVERRIDE - ${matchingRule.name}] Applied ${matchingRule.priorityLevel} rule (${adjType} ${rawValue})`);
    }

    // Determine normalized adjustment:
    // Legacy convention: negative numbers indicate deductions (e.g. -70 = 70% deduction or -2000 = ₹2,000 deduction)
    // Positive numbers with ruleType !== 'ADDITION' are also deduction rates (e.g. 15 = 15% deduction)
    let type: 'ADDITION' | 'DEDUCTION' | 'NEUTRAL' = 'NEUTRAL';
    let calculatedAmount = 0;

    if (ruleType === 'ADDITION' || rawValue > 0 && matchingRule?.ruleType === 'ADDITION') {
      type = 'ADDITION';
      calculatedAmount = Math.abs(rawValue);
      sumAdditions += calculatedAmount;
      ruleAuditLog.push(`[BONUS +₹${calculatedAmount.toLocaleString('en-IN')}] ${question.title}: ${answer.label}`);
    } else if (rawValue !== 0) {
      type = 'DEDUCTION';
      const magnitude = Math.abs(rawValue);

      if (adjType === 'PERCENTAGE') {
        sumPercentageDeductions += magnitude;
        // Individual preview amount for UI inspection
        calculatedAmount = Math.round((basePrice * magnitude) / 100);
        ruleAuditLog.push(`[PERCENTAGE DEDUCTION -${magnitude}% (≈ ₹${calculatedAmount.toLocaleString('en-IN')})] ${question.title}: ${answer.label}`);
      } else {
        sumFixedDeductions += magnitude;
        calculatedAmount = magnitude;
        ruleAuditLog.push(`[FIXED DEDUCTION -₹${magnitude.toLocaleString('en-IN')}] ${question.title}: ${answer.label}`);
      }
    }

    adjustments.push({
      questionTitle: question.title,
      answerLabel: answer.label,
      type,
      adjustmentType: adjType,
      adjustmentValue: rawValue,
      calculatedAmount,
      reason: answer.description || answer.label,
      isRejection: answer.isRejection === 1,
    });
  }

  // Mandatory Calculation Step:
  // Combined percentage deduction applied directly to original base price once
  const percentageDeductionAmount = Math.round(basePrice * (sumPercentageDeductions / 100));
  const totalDeductions = percentageDeductionAmount + sumFixedDeductions;

  let finalPrice = basePrice + sumAdditions - totalDeductions;

  if (isRejected || sumPercentageDeductions >= 100 || totalDeductions >= (basePrice + sumAdditions)) {
    finalPrice = 0;
    if (isRejected) {
      ruleAuditLog.push(`[FINAL] Device Rejected (₹0) - ${rejectionReason}`);
    } else {
      ruleAuditLog.push(`[FINAL] Total deductions (${sumPercentageDeductions}%) exceed base price. Final price set to ₹0`);
    }
  } else if (finalPrice < 0) {
    finalPrice = 0;
    ruleAuditLog.push(`[FLOOR] Final price capped to minimum ₹0`);
  }

  finalPrice = Math.max(0, Math.round(finalPrice));

  ruleAuditLog.push(
    `[SUMMARY] Base: ₹${basePrice.toLocaleString('en-IN')} | Total %: ${sumPercentageDeductions}% (-₹${percentageDeductionAmount.toLocaleString('en-IN')}) | Fixed Deductions: -₹${sumFixedDeductions.toLocaleString('en-IN')} | Total Deductions: -₹${totalDeductions.toLocaleString('en-IN')} | Final: ₹${finalPrice.toLocaleString('en-IN')}`
  );

  return {
    basePrice,
    estimatedPrice: finalPrice,
    totalAdditions: sumAdditions,
    totalDeductions,
    percentageDeductionRate: sumPercentageDeductions,
    percentageDeductionAmount,
    fixedDeductionAmount: sumFixedDeductions,
    adjustments,
    isRejected,
    rejectionReason,
    ruleAuditLog,
  };
}

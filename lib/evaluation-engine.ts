// Evaluation Engine - Core Business Logic
// Production-ready credit evaluation with comprehensive rules

export type DecisionType = 'APPROVE' | 'CONDITIONAL_APPROVE' | 'REVIEW' | 'REJECT'
export type SegmentType = 'LOW' | 'MID' | 'HIGH'

export interface CustomerData {
    age: number
    monthlyIncome: number
    employmentTenureMonths: number
    hasInternalDefault: boolean
    phone?: string
    idNumber?: string
}

export interface OperationData {
    productPrice: number
    downPayment: number
    termMonths: number
    monthlyPayment: number
    productName?: string
}

export interface Suggestion {
    type: 'increase_down_payment' | 'reduce_term' | 'reduce_amount'
    description: string
    currentValue: number
    suggestedValue: number
    impact: string
}

export interface EvaluationMetrics {
    dti: number
    downPaymentRatio: number
    financedAmount: number
}

export interface EvaluationResult {
    decision: DecisionType
    reasons: string[]
    suggestions: Suggestion[]
    metrics: EvaluationMetrics
    segment: SegmentType
}

// Policy Constants
const POLICY = {
    MIN_AGE: 18,
    MIN_EMPLOYMENT_MONTHS: 6,
    DTI_APPROVE_MAX: 0.35,
    DTI_REVIEW_MAX: 0.45,
    MIN_DOWN_PAYMENT_RATIO: 0.10,
    HIGH_TICKET_THRESHOLD: 300,
    SEGMENT_MID_MIN: 300,
    SEGMENT_HIGH_MIN: 900,
} as const

export class CreditEvaluationEngine {
    evaluate(customer: CustomerData, operation: OperationData): EvaluationResult {
        const reasons: string[] = []
        const suggestions: Suggestion[] = []
        let decision: DecisionType = 'APPROVE'

        // Calculate core metrics
        const dti = operation.monthlyPayment / customer.monthlyIncome
        const downPaymentRatio = operation.downPayment / operation.productPrice
        const financedAmount = operation.productPrice - operation.downPayment
        const segment = this.getSegment(operation.productPrice)

        const metrics: EvaluationMetrics = {
            dti: Number(dti.toFixed(4)),
            downPaymentRatio: Number(downPaymentRatio.toFixed(4)),
            financedAmount: Number(financedAmount.toFixed(2)),
        }

        // Rule 1: Age validation
        if (customer.age < POLICY.MIN_AGE) {
            return {
                decision: 'REJECT',
                reasons: [`Cliente menor de ${POLICY.MIN_AGE} años`],
                suggestions: [],
                metrics,
                segment,
            }
        }

        // Rule 2: Income validation
        if (customer.monthlyIncome <= 0) {
            return {
                decision: 'REVIEW',
                reasons: ['Ingreso mensual no proporcionado o inválido'],
                suggestions: [],
                metrics,
                segment,
            }
        }

        // Rule 3: Employment tenure
        if (customer.employmentTenureMonths < POLICY.MIN_EMPLOYMENT_MONTHS) {
            decision = 'REVIEW'
            reasons.push(
                `Antigüedad laboral baja (${customer.employmentTenureMonths} meses, recomendado mínimo ${POLICY.MIN_EMPLOYMENT_MONTHS})`
            )
        }

        // Rule 4: DTI Evaluation (Critical)
        if (dti > POLICY.DTI_REVIEW_MAX) {
            decision = 'REJECT'
            reasons.push(
                `DTI muy alto (${(dti * 100).toFixed(2)}%, máximo permitido ${(POLICY.DTI_REVIEW_MAX * 100).toFixed(0)}%)`
            )

            // Suggest term reduction
            const suggestedTerm = this.calculateMaxTermForDti(
                customer.monthlyIncome,
                financedAmount,
                POLICY.DTI_APPROVE_MAX
            )
            if (suggestedTerm > 0 && suggestedTerm < operation.termMonths) {
                const newPayment = financedAmount / suggestedTerm
                suggestions.push({
                    type: 'reduce_term',
                    description: `Reducir plazo a ${suggestedTerm} meses para DTI ≤ ${(POLICY.DTI_APPROVE_MAX * 100).toFixed(0)}%`,
                    currentValue: operation.termMonths,
                    suggestedValue: suggestedTerm,
                    impact: `Cuota $${newPayment.toFixed(2)}, DTI ${((newPayment / customer.monthlyIncome) * 100).toFixed(2)}%`,
                })
            }

            // Suggest amount reduction
            const maxAmount = customer.monthlyIncome * POLICY.DTI_APPROVE_MAX * operation.termMonths
            if (maxAmount < financedAmount) {
                const maxPrice = maxAmount + operation.downPayment
                suggestions.push({
                    type: 'reduce_amount',
                    description: `Reducir precio máximo a $${maxPrice.toFixed(2)} para DTI ≤ ${(POLICY.DTI_APPROVE_MAX * 100).toFixed(0)}%`,
                    currentValue: operation.productPrice,
                    suggestedValue: maxPrice,
                    impact: `DTI ${(POLICY.DTI_APPROVE_MAX * 100).toFixed(0)}%`,
                })
            }
        } else if (dti > POLICY.DTI_APPROVE_MAX) {
            if (decision !== 'REJECT') {
                decision = decision === 'APPROVE' ? 'REVIEW' : decision
            }
            reasons.push(
                `DTI elevado (${(dti * 100).toFixed(2)}%, recomendado ≤ ${(POLICY.DTI_APPROVE_MAX * 100).toFixed(0)}%)`
            )

            // Suggest improvements
            const suggestedTerm = this.calculateMaxTermForDti(
                customer.monthlyIncome,
                financedAmount,
                POLICY.DTI_APPROVE_MAX
            )
            if (suggestedTerm > 0 && suggestedTerm < operation.termMonths) {
                const newPayment = financedAmount / suggestedTerm
                suggestions.push({
                    type: 'reduce_term',
                    description: `Reducir plazo a ${suggestedTerm} meses`,
                    currentValue: operation.termMonths,
                    suggestedValue: suggestedTerm,
                    impact: `DTI de ${(dti * 100).toFixed(2)}% a ${((newPayment / customer.monthlyIncome) * 100).toFixed(2)}%`,
                })
            }
        }

        // Rule 5: Down payment validation
        if (operation.productPrice > POLICY.HIGH_TICKET_THRESHOLD) {
            if (downPaymentRatio < POLICY.MIN_DOWN_PAYMENT_RATIO) {
                if (decision === 'APPROVE') {
                    decision = 'CONDITIONAL_APPROVE'
                }
                reasons.push(
                    `Entrada baja para ticket > $${POLICY.HIGH_TICKET_THRESHOLD} (${(downPaymentRatio * 100).toFixed(1)}%, mínimo ${(POLICY.MIN_DOWN_PAYMENT_RATIO * 100).toFixed(0)}%)`
                )

                const minDownPayment = operation.productPrice * POLICY.MIN_DOWN_PAYMENT_RATIO
                const newFinanced = operation.productPrice - minDownPayment
                const newPayment = newFinanced / operation.termMonths
                const newDti = newPayment / customer.monthlyIncome

                suggestions.push({
                    type: 'increase_down_payment',
                    description: `Aumentar entrada a $${minDownPayment.toFixed(2)} (${(POLICY.MIN_DOWN_PAYMENT_RATIO * 100).toFixed(0)}% del precio)`,
                    currentValue: operation.downPayment,
                    suggestedValue: minDownPayment,
                    impact: `DTI de ${(dti * 100).toFixed(2)}% a ${(newDti * 100).toFixed(2)}%`,
                })
            }
        }

        // Rule 6: Internal default check
        if (customer.hasInternalDefault) {
            decision = 'REVIEW'
            reasons.push('Cliente con historial de mora interna')
        }

        // Limit reasons and suggestions
        const finalReasons = reasons.slice(0, 3)
        const finalSuggestions = suggestions.slice(0, 3)

        return {
            decision,
            reasons: finalReasons.length > 0 ? finalReasons : [`Cliente elegible (DTI ${(dti * 100).toFixed(2)}%)`],
            suggestions: finalSuggestions,
            metrics,
            segment,
        }
    }

    private getSegment(price: number): SegmentType {
        if (price <= POLICY.SEGMENT_MID_MIN) return 'LOW'
        if (price <= POLICY.SEGMENT_HIGH_MIN) return 'MID'
        return 'HIGH'
    }

    private calculateMaxTermForDti(
        monthlyIncome: number,
        financedAmount: number,
        targetDti: number
    ): number {
        const maxPayment = monthlyIncome * targetDti
        if (maxPayment <= 0) return 0
        return Math.max(1, Math.floor(financedAmount / maxPayment))
    }
}

// Export singleton instance
export const evaluationEngine = new CreditEvaluationEngine()

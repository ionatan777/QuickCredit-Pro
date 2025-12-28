import { NextResponse } from 'next/server'
import { evaluationEngine, type CustomerData, type OperationData } from '@/lib/evaluation-engine'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { customer, operation, userId } = body

        // Validate input
        if (!customer || !operation) {
            return NextResponse.json(
                { error: 'Customer and operation data are required' },
                { status: 400 }
            )
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 401 }
            )
        }

        // Evaluate using the credit engine
        const result = evaluationEngine.evaluate(customer as CustomerData, operation as OperationData)

        // Save to Supabase
        const { data: evaluation, error: dbError } = await supabase
            .from('evaluations')
            .insert({
                // Customer data
                customer_age: customer.age,
                customer_monthly_income: customer.monthlyIncome,
                customer_employment_tenure_months: customer.employmentTenureMonths,
                customer_has_internal_default: customer.hasInternalDefault || false,
                customer_phone: customer.phone,
                customer_id_number: customer.idNumber,

                // Operation data
                operation_product_price: operation.productPrice,
                operation_down_payment: operation.downPayment,
                operation_term_months: operation.termMonths,
                operation_monthly_payment: operation.monthlyPayment,
                operation_product_name: operation.productName,

                // Results
                decision: result.decision,
                segment: result.segment,

                // Metrics
                metric_dti: result.metrics.dti,
                metric_down_payment_ratio: result.metrics.downPaymentRatio,
                metric_financed_amount: result.metrics.financedAmount,

                // Additional data
                reasons: result.reasons,
                suggestions: result.suggestions,

                // Metadata
                evaluated_by: userId,
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            return NextResponse.json(
                { error: 'Failed to save evaluation', details: dbError.message },
                { status: 500 }
            )
        }

        // Return the complete result
        return NextResponse.json({
            evaluationId: evaluation.id,
            decision: result.decision,
            segment: result.segment,
            reasons: result.reasons,
            suggestions: result.suggestions,
            metrics: result.metrics,
            evaluatedAt: evaluation.created_at,
        })
    } catch (error) {
        console.error('Evaluation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Get all evaluations with optional filtering
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const limit = parseInt(searchParams.get('limit') || '50')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 401 }
            )
        }

        // Get user's role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

        let query = supabase
            .from('evaluations')
            .select(`
        id,
        decision,
        segment,
        customer_age,
        operation_product_price,
        metric_dti,
        created_at,
        evaluated_by,
        profiles:evaluated_by (full_name)
      `)
            .order('created_at', { ascending: false })
            .limit(limit)

        // If user is not admin, only show their evaluations
        if (profile?.role !== 'admin') {
            query = query.eq('evaluated_by', userId)
        }

        const { data: evaluations, error } = await query

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch evaluations' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            total: evaluations?.length || 0,
            items: evaluations || [],
        })
    } catch (error) {
        console.error('Get evaluations error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

import { NextResponse } from 'next/server'
import { evaluationEngine, type CustomerData, type OperationData } from '@/lib/evaluation-engine'

// In-memory storage for MVP (easy to migrate to Supabase later)
interface StoredEvaluation {
    id: string
    customer: CustomerData
    operation: OperationData
    result: any
    evaluatedBy: string
    createdAt: string
}

const evaluations: StoredEvaluation[] = []

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { customer, operation, evaluatedBy = 'seller1' } = body

        // Validate input
        if (!customer || !operation) {
            return NextResponse.json(
                { error: 'Customer and operation data are required' },
                { status: 400 }
            )
        }

        // Evaluate
        const result = evaluationEngine.evaluate(customer as CustomerData, operation as OperationData)

        // Store evaluation
        const evaluation: StoredEvaluation = {
            id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            customer,
            operation,
            result,
            evaluatedBy,
            createdAt: new Date().toISOString(),
        }

        evaluations.push(evaluation)

        // Return result with ID
        return NextResponse.json({
            evaluationId: evaluation.id,
            ...result,
            evaluatedAt: evaluation.createdAt,
            evaluatedBy: evaluation.evaluatedBy,
        })
    } catch (error) {
        console.error('Evaluation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Get all evaluations
export async function GET() {
    try {
        const items = evaluations.map((evaluation) => ({
            evaluationId: evaluation.id,
            decision: evaluation.result.decision,
            customerAge: evaluation.customer.age,
            productPrice: evaluation.operation.productPrice,
            segment: evaluation.result.segment,
            evaluatedAt: evaluation.createdAt,
            evaluatedBy: evaluation.evaluatedBy,
        }))

        return NextResponse.json({
            total: items.length,
            items: items.reverse(), // Most recent first
        })
    } catch (error) {
        console.error('Get evaluations error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

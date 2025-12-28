import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types for our database tables
export interface Profile {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'seller'
    store_id?: string
    created_at: string
    updated_at: string
}

export interface Evaluation {
    id: string
    customer_age: number
    customer_monthly_income: number
    customer_employment_tenure_months: number
    customer_has_internal_default: boolean
    customer_phone?: string
    customer_id_number?: string
    operation_product_price: number
    operation_down_payment: number
    operation_term_months: number
    operation_monthly_payment: number
    operation_product_name: string
    decision: 'APPROVE' | 'CONDITIONAL_APPROVE' | 'REVIEW' | 'REJECT'
    segment: 'LOW' | 'MID' | 'HIGH'
    metric_dti: number
    metric_down_payment_ratio: number
    metric_financed_amount: number
    reasons: string[]
    suggestions: any[]
    evaluated_by: string
    store_id?: string
    created_at: string
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle2, TrendingUp, Zap, Shield, BarChart3, Users, LogOut } from 'lucide-react'

export default function DashboardPage() {
    const { user, profile, loading, signOut } = useAuth()
    const router = useRouter()

    const [formData, setFormData] = useState({
        age: '28',
        monthlyIncome: '1500',
        employmentTenureMonths: '24',
        hasInternalDefault: false,
        productPrice: '800',
        downPayment: '100',
        termMonths: '12',
        monthlyPayment: '58.33',
        productName: 'Smartphone'
    })

    const [result, setResult] = useState<any>(null)
    const [evaluating, setEvaluating] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    const handleEvaluate = async () => {
        if (!user) return

        setEvaluating(true)
        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: {
                        age: parseInt(formData.age),
                        monthlyIncome: parseFloat(formData.monthlyIncome),
                        employmentTenureMonths: parseInt(formData.employmentTenureMonths),
                        hasInternalDefault: formData.hasInternalDefault,
                    },
                    operation: {
                        productPrice: parseFloat(formData.productPrice),
                        downPayment: parseFloat(formData.downPayment),
                        termMonths: parseInt(formData.termMonths),
                        monthlyPayment: parseFloat(formData.monthlyPayment),
                        productName: formData.productName,
                    },
                    userId: user.id,
                }),
            })

            const data = await response.json()
            if (response.ok) {
                setResult(data)
            } else {
                alert('Error: ' + (data.error || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error de conexión')
        } finally {
            setEvaluating(false)
        }
    }

    const handleLogout = async () => {
        await signOut()
        router.push('/login')
    }

    const getDecisionColor = (decision: string) => {
        switch (decision) {
            case 'APPROVE': return 'from-green-500 to-emerald-600'
            case 'CONDITIONAL_APPROVE': return 'from-yellow-500 to-orange-500'
            case 'REVIEW': return 'from-blue-500 to-indigo-600'
            case 'REJECT': return 'from-red-500 to-rose-600'
            default: return 'from-gray-500 to-slate-600'
        }
    }

    if (loading || !user || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-600 to-emerald-500 text-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                <Zap className="w-7 h-7 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">QuickCredit Pro</h1>
                                <p className="text-green-100 text-sm">Bienvenido, {profile.full_name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Salir</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Evaluación Instantánea</h3>
                        <p className="text-slate-600">Decisión crediticia en menos de 30 segundos</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Control de Riesgo</h3>
                        <p className="text-slate-600">Política crediticia configurable</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Datos en Tiempo Real</h3>
                        <p className="text-slate-600">Guardado automático en la nube</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <Users className="w-6 h-6 mr-2 text-green-600" />
                            Nueva Evaluación
                        </h2>

                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                                <h3 className="font-semibold text-lg">Datos del Cliente</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Edad</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Ingreso Mensual ($)</label>
                                        <input
                                            type="number"
                                            value={formData.monthlyIncome}
                                            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Antigüedad Laboral (meses)</label>
                                        <input
                                            type="number"
                                            value={formData.employmentTenureMonths}
                                            onChange={(e) => setFormData({ ...formData, employmentTenureMonths: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                                <h3 className="font-semibold text-lg">Datos de la Operación</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Producto</label>
                                        <input
                                            type="text"
                                            value={formData.productName}
                                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Precio ($)</label>
                                        <input
                                            type="number"
                                            value={formData.productPrice}
                                            onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Entrada ($)</label>
                                        <input
                                            type="number"
                                            value={formData.downPayment}
                                            onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Plazo (meses)</label>
                                        <input
                                            type="number"
                                            value={formData.termMonths}
                                            onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Cuota Mensual ($)</label>
                                        <input
                                            type="number"
                                            value={formData.monthlyPayment}
                                            onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleEvaluate}
                                disabled={evaluating}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {evaluating ? (
                                    <>
                                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                                        <span>Evaluando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        <span>Evaluar Crédito</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
                        <h2 className="text-2xl font-bold mb-6">Resultado de Evaluación</h2>

                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                                <CheckCircle2 className="w-20 h-20 mb-4" />
                                <p className="text-lg">Completa el formulario y evalúa para ver resultados</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Decision */}
                                <div className={`bg-gradient-to-r ${getDecisionColor(result.decision)} rounded-2xl p-8 text-white`}>
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">
                                            {result.decision === 'APPROVE' && '✓'}
                                            {result.decision === 'CONDITIONAL_APPROVE' && '⚠'}
                                            {result.decision === 'REVIEW' && 'ℹ'}
                                            {result.decision === 'REJECT' && '✗'}
                                        </div>
                                        <h3 className="text-3xl font-bold mb-2">{result.decision}</h3>
                                        <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                            Segmento: {result.segment}
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-slate-900">
                                            {(result.metrics.dti * 100).toFixed(2)}%
                                        </div>
                                        <div className="text-sm text-slate-600">DTI</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-slate-900">
                                            {(result.metrics.downPaymentRatio * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-slate-600">Entrada</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-slate-900">
                                            ${result.metrics.financedAmount.toFixed(0)}
                                        </div>
                                        <div className="text-sm text-slate-600">Financiado</div>
                                    </div>
                                </div>

                                {/* Reasons */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Motivos:</h4>
                                    {result.reasons.map((reason: string, i: number) => (
                                        <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm">
                                            {reason}
                                        </div>
                                    ))}
                                </div>

                                {/* Suggestions */}
                                {result.suggestions && result.suggestions.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-green-600">💡 Sugerencias:</h4>
                                        {result.suggestions.map((sug: any, i: number) => (
                                            <div key={i} className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                                <div className="font-semibold text-green-900 mb-2">{sug.description}</div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-slate-600">Actual:</span>
                                                        <span className="font-bold ml-2">${sug.currentValue.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-600">Sugerido:</span>
                                                        <span className="font-bold ml-2 text-green-600">${sug.suggestedValue.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-xs text-slate-600">{sug.impact}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 bg-slate-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-slate-400">Creado por Jhonatan Pillajo © 2025</p>
                    <p className="text-sm text-slate-500 mt-2">CodelyLabs</p>
                </div>
            </footer>
        </div>
    )
}

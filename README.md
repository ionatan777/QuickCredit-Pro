# QuickCredit Pro 🚀

**Sistema Profesional de Originación Rápida de Crédito**

Plataforma empresarial de evaluación crediticia en tiempo real construida con Next.js 14, TypeScript y TailwindCSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## 🎯 ¿Qué es QuickCredit Pro?

QuickCredit Pro permite a tiendas y comercios evaluar clientes en **30 segundos** y recibir:
- ✅ Decisión crediticia instantánea (APPROVE, REVIEW, REJECT)
- 💡 Sugerencias automáticas para cerrar ventas
- 📊 Métricas de riesgo (DTI, entrada, monto financiado)
- 🎯 Recomendaciones accionables

---

## ✨ Características

### Para Vendedores
- ⚡ **Evaluación instantánea** en menos de 30 segundos
- 💰 **Sugerencias inteligentes** para aprobar créditos
- 📱 **Interfaz moderna** fácil de usar
- 📊 **Historial** de evaluaciones

### Para Administradores
- 🎛️ **Control de riesgo** con política configurable
- 📈 **Analytics** en tiempo real
- 👥 **Gestión multi-usuario**
- 📉 **Dashboard** con métricas clave

### Técnicas
- 🚀 **Next.js 14** (App Router)
- 💪 **TypeScript** 100%
- 🎨 **TailwindCSS** para diseño moderno
- ⚡ **Server Components** para mejor performance
- 📱 **Responsive** (móvil, tablet, desktop)

---

## 🚀 Demo en Vivo

**URL**: [En proceso de deploy]

**Credenciales de prueba**:
- Usuario vendedor: `seller1` / `seller123`
- Usuario admin: `admin` / `admin123`

---

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/ionatan777/QuickCredit-Pro.git
cd QuickCredit-Pro

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm run dev

# 4. Abrir en el navegador
http://localhost:3000
```

¡Ya está funcionando! 🎉

---

## 🎮 Uso

### Evaluar un Crédito

1. **Ingresar datos del cliente:**
   - Edad
   - Ingreso mensual
   - Antigüedad laboral
   - Historial de mora (opcional)

2. **Ingresar datos de la operación:**
   - Producto
   - Precio
   - Entrada
   - Plazo
   - Cuota mensual

3. **Click en "Evaluar Crédito"**

4. **Ver resultado:**
   - 🟢 **APPROVE**: Cliente elegible, cerrar venta
   - 🟡 **CONDITIONAL_APPROVE**: Ajustar entrada/plazo según sugerencias
   - 🔵 **REVIEW**: Requiere aprobación manual
   - 🔴 **REJECT**: No cumple política, ver sugerencias alternativas

---

## 🧠 Motor de Evaluación

### Reglas de Política

```typescript
// Hard Rules
- Edad >= 18 años → REJECT si no cumple
- Ingreso > 0 → REVIEW si no cumple
- Antigüedad laboral >= 6 meses → REVIEW si no cumple

// DTI (Debt-to-Income Ratio)
DTI = Cuota Mensual / Ingreso Mensual

- DTI <= 35% → APPROVE ✅
- 35% < DTI <= 45% → REVIEW ⚠️
- DTI > 45% → REJECT ❌

// Entrada mínima
- Productos > $300 requieren >= 10% entrada
- Si no cumple → CONDITIONAL_APPROVE con sugerencia
```

### Sugerencias Automáticas

El sistema calcula automáticamente:
1. **Aumentar entrada**: Calcula entrada mínima para aprobar
2. **Reducir plazo**: Calcula plazo óptimo para DTI aceptable
3. **Reducir monto**: Calcula precio máximo financiable

**Ejemplo:**
```
Cliente con DTI 50% (muy alto)
→ Sistema sugiere: Reducir plazo de 24 a 16 meses
→ Nuevo DTI: 34% ✅ APROBADO
```

---

## 🏗️ Arquitectura

```
credit-origination-pro/
├── app/
│   ├── api/
│   │   ├── evaluate/route.ts    # POST /api/evaluate
│   │   └── health/route.ts      # Health check
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Tailwind base
├── lib/
│   ├── evaluation-engine.ts     # Motor de evaluación ⭐
│   └── utils.ts                 # Helpers
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 📊 API Documentation

### POST /api/evaluate

Evalúa una solicitud de crédito.

**Request:**
```json
{
  "customer": {
    "age": 28,
    "monthlyIncome": 1500,
    "employmentTenureMonths": 24,
    "hasInternalDefault": false
  },
  "operation": {
    "productPrice": 800,
    "downPayment": 100,
    "termMonths": 12,
    "monthlyPayment": 58.33,
    "productName": "Smartphone"
  }
}
```

**Response:**
```json
{
  "evaluationId": "eval_1704123456789_abc123",
  "decision": "APPROVE",
  "reasons": ["Cliente elegible (DTI 3.89%)"],
  "suggestions": [],
  "metrics": {
    "dti": 0.0389,
    "downPaymentRatio": 0.125,
    "financedAmount": 700
  },
  "segment": "MID",
  "evaluatedAt": "2024-01-01T12:00:00.000Z"
}
```

---

## 🚀 Deploy a Producción

### Opción 1: Vercel (Recomendado)

**1 Click Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ionatan777/QuickCredit-Pro)

**Manual:**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Production deploy
vercel --prod
```

### Opción 2: Docker

```bash
# Build
docker build -t quickcredit-pro .

# Run
docker run -p 3000:3000 quickcredit-pro
```

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local`:

```env
# Database (futuro)
DATABASE_URL=

# Supabase (futuro)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Personalizar Política de Crédito

Edita `lib/evaluation-engine.ts`:

```typescript
const POLICY = {
  MIN_AGE: 18,                    // Edad mínima
  MIN_EMPLOYMENT_MONTHS: 6,       // Antigüedad laboral
  DTI_APPROVE_MAX: 0.35,          // DTI máximo para aprobar
  DTI_REVIEW_MAX: 0.45,           // DTI máximo antes de rechazar
  MIN_DOWN_PAYMENT_RATIO: 0.10,   // Entrada mínima (%)
  HIGH_TICKET_THRESHOLD: 300,     // Threshold para entrada
}
```

---

## 🛣️ Roadmap

### v1.1 (Próximo)
- [ ] Integración con Supabase
- [ ] Autenticación real (JWT)
- [ ] Multi-tenant
- [ ] Admin dashboard completo

### v1.2 (Futuro)
- [ ] Integración con bureaus de crédito
- [ ] Webhooks
- [ ] API pública
- [ ] Mobile app

---

## 💼 Modelo de Negocio

**Precio sugerido (SaaS):**

| Plan | Precio/mes | Características |
|------|-----------|----------------|
| **Básico** | $99 | 1 tienda, 500 eval/mes |
| **Pro** | $299 | 5 tiendas, ilimitado |
| **Enterprise** | $999 | White-label, custom |

**ROI proyectado:**
- 10 clientes Básico + 5 Pro + 2 Enterprise = **$53K/año**

---

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE)

---

## 👨‍💻 Autor

**Jhonatan Pillajo**
- GitHub: [@ionatan777](https://github.com/ionatan777)
- Empresa: **CodelyLabs**

---

## 🤝 Contribuir

Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

¿Preguntas o sugerencias?
- 📧 Email: ionatan777@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/ionatan777/QuickCredit-Pro/issues)

---

## ⭐ Agradecimientos

- Next.js Team por el increíble framework
- Vercel por el hosting gratuito
- TailwindCSS por el sistema de diseño

---

<div align="center">

**¿Te gustó el proyecto? Dale ⭐ en GitHub!**

Hecho con ❤️ por CodelyLabs © 2025

</div>

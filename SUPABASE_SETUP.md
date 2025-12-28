# 🚀 Guía de Configuración de Supabase

Sigue estos pasos para configurar Supabase y tener tu sistema production-ready en menos de 30 minutos.

---

## Paso 1: Crear Proyecto en Supabase (5 minutos)

### 1.1 Crear cuenta
1. Ve a [supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Regístrate con GitHub o email

### 1.2 Crear nuevo proyecto
1. Click en "New Project"
2. Nombre: `quickcredit-pro`
3. Database Password: Guarda esta contraseña (**importante**)
4. Region: Elige la más cercana
5. Click en "Create new project"

⏰ Espera 2-3 minutos mientras se crea el proyecto

---

## Paso 2: Ejecutar el Schema SQL (10 minutos)

### 2.1 Abrir SQL Editor
1. En el dashboard de Supabase, ve a **SQL Editor** (menú izquierdo)
2. Click en "+ New query"

### 2.2 Copiar y ejecutar el schema
1. Abre el archivo `supabase/schema.sql`
2. Copia TODO el contenido
3. Pégalo en el SQL Editor
4. Click en "Run" o `Ctrl + Enter`

✅ Deberías ver: "Success. No rows returned"

### 2.3 Verificar tablas creadas
1. Ve a **Table Editor** (menú izquierdo)
2. Deberías ver:
   - `profiles`
   - `evaluations`
   - `evaluation_stats` (view)

---

## Paso 3: Crear Usuarios de Prueba (5 minutos)

### 3.1 Crear usuarios en Authentication
1. Ve a **Authentication** > **Users** (menú izquierdo)
2. Click en "Add user" > "Create new user"

**Usuario Admin:**
- Email: `admin@quickcredit.com`
- Password: `admin123` (o la que prefieras)
- Auto Confirm User: ✅ Activar

**Usuario Vendedor:**
- Email: `seller@quickcredit.com`
- Password: `seller123`
- Auto Confirm User: ✅ Activar

### 3.2 Actualizar roles en SQL
1. Ve de nuevo a **SQL Editor**
2. Ejecuta este SQL:

```sql
-- Actualizar rol de admin
UPDATE public.profiles 
SET role = 'admin', full_name = 'Admin User'
WHERE email = 'admin@quickcredit.com';

-- Actualizar rol de vendedor
UPDATE public.profiles
SET role = 'seller', full_name = 'Vendedor Demo'
WHERE email = 'seller@quickcredit.com';
```

---

## Paso 4: Obtener Credenciales (2 minutos)

### 4.1 Ir a Project Settings
1. Click en el ícono de engranaje ⚙️ (abajo izquierda)
2. Ve a **API** section

### 4.2 Copiar credenciales
Necesitas estos 2 valores:

📋 **Project URL:**
```
https://[tu-proyecto].supabase.co
```

🔑 **anon/public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Paso 5: Configurar Variables de Entorno (3 minutos)

### 5.1 Crear archivo .env.local
En la raíz del proyecto, crea `.env.local`:

```bash
# En la terminal
cd C:\Users\GYGABYTE\.gemini\antigravity\scratch\credit-origination-pro
code .env.local  # o notepad .env.local
```

### 5.2 Pegar credenciales
```env
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Importante:** Reemplaza `[tu-proyecto]` y la key con tus valores reales.

---

## Paso 6: Reiniciar el Servidor (1 minuto)

### 6.1 Detener servidor actual
En la terminal donde corre `npm run dev`:
- Presiona `Ctrl + C`

### 6.2 Reiniciar
```bash
npm run dev
```

---

## Paso 7: Probar la Aplicación (5 minutos)

### 7.1 Abrir en navegador
```
http://localhost:3000
```

Deberías ver la página de login.

### 7.2 Iniciar sesión
**Credenciales de Admin:**
- Email: `admin@quickcredit.com`
- Password: `admin123`

**Credenciales de Vendedor:**
- Email: `seller@quickcredit.com`
- Password: `seller123`

### 7.3 Probar evaluación
1. Llena el formulario de evaluación
2. Click en "Evaluar Crédito"
3. ✅ Deberías ver el resultado

### 7.4 Verificar en Supabase
1. Ve a Supabase > **Table Editor** > `evaluations`
2. ✅ Deberías ver tu evaluación guardada

---

## ✅ Checklist de Verificación

- [ ] Proyecto Supabase creado
- [ ] Schema SQL ejecutado exitosamente
- [ ] Tablas `profiles` y `evaluations` visibles
- [ ] 2 usuarios creados (admin y seller)
- [ ] Roles actualizados en base de datos
- [ ] Archivo `.env.local` creado con credenciales
- [ ] Servidor reiniciado
- [ ] Login exitoso
- [ ] Evaluación guardada en base de datos

---

## 🔧 Troubleshooting

### Error: "Invalid API key"
- ✅ Verifica que copiaste la **anon key** completa
- ✅ Asegúrate de que `.env.local` está en la raíz del proyecto
- ✅ Reinicia el servidor después de crear `.env.local`

### Error: "Failed to save evaluation"
- ✅ Verifica que el schema SQL se ejecutó completamente
- ✅ Verifica que el usuario está autenticado
- ✅ Revisa las RLS policies en Supabase

### No puedo iniciar sesión
- ✅ Verifica que creaste los usuarios en Authentication
- ✅ Verifica que marcaste "Auto Confirm User"
- ✅ Verifica que actualizaste los roles en SQL

### La evaluación no se guarda
- ✅ Abre la consola del navegador (F12)
- ✅ Busca errores en rojo
- ✅ Verifica que la tabla `evaluations` existe
- ✅ Verifica las RLS policies

---

## 📊 Verificar que Todo Funciona

### Test Completo:
1. **Login** → Deberías ver el dashboard
2. **Evaluar** → Deberías ver resultado
3. **Supabase** → Debería aparecer en la tabla `evaluations`
4. **Logout** → Deberías volver al login

---

## 🎉 ¡Listo para Producción!

Una vez que todo funciona:

### Deploy a Vercel
```bash
vercel
```

### Agregar variables en Vercel
1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador (F12)
2. Revisa los logs en Supabase Dashboard
3. Verifica que todas las variables de entorno estén configuradas

---

**Tiempo total estimado: 30 minutos** ⏱️

¡Tu sistema QuickCredit Pro está production-ready! 🚀

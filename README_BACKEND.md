# Arquitectura y Diseño del Backend

Este documento sirve como guía para entender cómo fue construido el backend, qué tecnologías usamos y por qué tomamos esas decisiones arquitectónicas. Es ideal para preparar tu presentación.

---

## 1. Tecnologías Principales (Stack Tecnológico)

El backend fue construido usando el ecosistema de **Node.js** enfocado en la robustez y escalabilidad:

- **Node.js & Express:** Elegimos Express por ser el framework web más maduro y ligero de Node.js. Nos permite construir una API RESTful rápida sin la sobrecarga de frameworks más pesados.
- **TypeScript:** Se utilizó TypeScript en lugar de JavaScript puro. ¿Por qué? Porque el tipado estático nos evita dolores de cabeza, reduce los errores en tiempo de ejecución (ej. mandar un `string` cuando la base de datos espera un `number`) y ofrece autocompletado en los editores de código para todo el equipo.
- **Prisma ORM:** Prisma es un ORM (Mapeador Objeto-Relacional) moderno. En lugar de escribir sentencias SQL complejas manualmente, Prisma nos permite definir nuestros modelos de forma clara (en `schema.prisma`) e interactuar con la base de datos usando objetos y funciones de TypeScript. Elegimos la versión 7 por su soporte nativo de adaptadores.
- **PostgreSQL (Supabase):** Elegimos una base de datos relacional porque la información de nuestra app (Usuarios -> Pedidos -> Productos) está altamente estructurada e interconectada. Supabase fue elegido para alojarla en la nube gratuitamente, quitándonos el peso de mantener un contenedor Docker en producción.
- **pnpm:** Como gestor de paquetes. Es mucho más rápido que `npm` o `yarn` y optimiza el espacio en disco compartiendo dependencias.

---

## 2. Estructura del Proyecto (Arquitectura en Capas)

Usamos una arquitectura basada en **Capas (Layered Architecture)** y separada por responsabilidades (Separation of Concerns). Esto significa que cada archivo tiene un único trabajo.

```text
src/
├── config/       # Configuración global
│   ├── prisma.ts # Instancia única de conexión a la BD
│   └── swagger.ts# Configuración de los documentos OpenAPI
├── controllers/  # La Lógica de Negocio (El cerebro)
│   ├── authController.ts
│   ├── productController.ts
│   └── ...
├── middlewares/  # Guardianes e Interceptores
│   └── authMiddleware.ts
├── routes/       # Las "Puertas" de la API (Endpoints)
│   ├── authRoutes.ts
│   ├── productRoutes.ts
│   └── ...
├── app.ts        # Ensambla la aplicación (Une rutas y configuraciones)
└── index.ts      # Enciende el motor (Inicia el servidor en el puerto 3000)
```

### ¿Por qué esta estructura?
- **Rutas (`routes/`):** Solo definen el "camino" y quién tiene permiso de entrar.
- **Controladores (`controllers/`):** Toman la solicitud, hacen la magia (hablan con Prisma, validan datos) y devuelven la respuesta.
- **Desacoplamiento (`app.ts` vs `index.ts`):** Separamos la app del puerto que la levanta para poder inyectarla en un entorno de pruebas automáticas (como Jest y Supertest) sin que intente levantar un servidor real cada vez.

---

## 3. Seguridad y Autenticación

Implementamos **JWT (JSON Web Tokens)** para la seguridad.
- **¿Por qué JWT?** Es ideal para APIs REST (que por definición no deben guardar estado en el servidor - *Stateless*). El servidor firma un pase temporal que el cliente guarda (en su frontend) y envía en cada petición para comprobar quién es.
- **Contraseñas:** Usamos **Bcrypt.js** para cifrar las contraseñas ("hashearlas") antes de guardarlas en la base de datos. Jamás guardamos contraseñas en texto plano.
- **Roles y Permisos:** Construimos un Middleware (`authorizeRole`) que actúa como un guardián de seguridad en la puerta de las rutas. Solo los usuarios con rol `ADMIN` pueden crear productos o modificar estados de pedidos, mientras que el rol `CLIENT` solo puede comprar y ver el catálogo.

---

## 4. Documentación Automática (Swagger)

Añadimos **Swagger (OpenAPI)** porque una API sin documentación es inservible para el equipo de Frontend. 
- A través de comentarios estructurados (`JSDoc`), generamos una página web visual (`/api-docs`) donde tus compañeros pueden ver exactamente qué datos necesitan enviar y qué van a recibir, e incluso probar las peticiones directamente desde la web, sin necesidad de usar herramientas externas como Postman.

---

## 5. Diseño de Base de Datos (Relacional)

Nuestro esquema garantiza la integridad de datos:
- **Transacciones Seguras:** Al realizar un Pedido (Order), hacemos una transacción múltiple en Prisma. Si un cliente compra algo, se crea el pedido Y se reduce el stock del producto **al mismo tiempo**. Si alguna de las dos falla, la operación completa se cancela (Rollback). Esto previene que un cliente pague por algo que se quedó sin stock justo ese milisegundo.

## Resumen para tu defensa
Si te preguntan: *"¿Por qué lo hicieron así?"*
Tu respuesta principal debe ser: **"Buscamos escalabilidad, tipado fuerte para evitar errores en producción, y una separación clara de responsabilidades para que el frontend pueda consumir nuestros datos de manera segura y documentada."**

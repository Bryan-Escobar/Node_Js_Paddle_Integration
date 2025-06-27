
# Node.js Paddle Integration

Este proyecto es una integración de la pasarela de pago **Paddle** utilizando **Node.js**. Su objetivo principal es facilitar el manejo de transacciones, suscripciones y pagos en línea de manera segura y eficiente, permitiendo a los desarrolladores incorporar fácilmente funcionalidades de pago en sus aplicaciones.

## ¿Qué es Paddle?

[Paddle](https://paddle.com/) es una plataforma de pagos global que simplifica la gestión de pagos, facturación, suscripciones y cumplimiento fiscal para productos digitales y SaaS.

## Características principales

- Integración completa con la API de Paddle para procesar pagos y suscripciones.
- Manejo seguro de datos sensibles mediante variables de entorno.
- Documentación de la API con Swagger.
- Estructura modular y escalable basada en buenas prácticas de desarrollo con TypeScript.

## Tecnologías utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **TypeScript**: Tipado estático para mayor robustez y mantenibilidad.
- **Express**: Framework minimalista para la creación de APIs REST.
- **Prisma ORM**: Mapeo objeto-relacional para la gestión de la base de datos.
- **Swagger**: Generación automática de documentación interactiva para la API.
- **dotenv**: Manejo de variables de entorno.
- **@google/genai**: Integración con Gemini para funcionalidades de IA (opcional).
- **tsx**: Ejecución y recarga en caliente de archivos TypeScript.

## Estructura del proyecto

- `src/`: Código fuente principal.
    - `config/`: Configuración y variables de entorno.
    - `domain/`: Reglas de negocio, interfaces y tipos personalizados.
    - `presentation/`: Controladores, servicios y rutas de la API.
- `.env`: Variables de entorno (no subir a repositorios públicos).
- `package.json`: Dependencias y scripts del proyecto.

## ¿Para quién es este proyecto?

Ideal para desarrolladores y empresas que buscan integrar pagos y suscripciones en sus aplicaciones Node.js de forma rápida, segura y con soporte para la gestión de usuarios y transacciones.

---
## Pasos para levantar el proyecto

1-Instalar las dependencias
```npm i```


2-copiar el .env.template y renombarlo a .env y luego rellenar los datos solicitados (el .env nunca se debe subir a los repositorios de github)

3-Ejecutar ````npx prisma generate```` para generar el cliente del ORM PRISMA

3-Ejecutar ```npm run dev``` para ejecutar el programa

3-Abrir postman y hacer una solicitud GET a la url ```localhost:3000/api/overview```
    Si postman devuelve:
    ```{
        "message": "API is running"
       }
    ```
    Significa que la api esta corriendo como debe

## OTROS COMANDOS UTILES PARA BASES DE DATOS:
COMANDO PARA GENERAR EL SCHEMA/CLIENTE DE PRISMA: ````npx prisma generate````
COMANDO PARA CREAR DB EN BASE AL ORM: ````npx prisma migrate dev --name init````
COMANDO PARA CREAR LOS MODELOS DEL ORM SI LA BASE YA EXISTE: ````npx prisma db pull````








## estructura principal del proyecto
src->aca se colocan los archivos principales de codigo ts
    config/envs.ts-->aca se importan las variables de entorno

    domain--> aca se almacenan las reglas de negocio (interfaces y tipos de dato personalizados)

    presentation-->aca se ubican las clases principales y modulos del proyecto
    
        presentation/services-->aca se ubican las clases principales que tendran los metodos de la api
         (Ej: Clase Usuario (metodos crud de usuario)), estos seran utilizados por el programa en el server.ts

        presentation/controladores (EJ: usuarioController)-->Aca se mandan a llamar los metodos de las clase de services,  y se organizan en controladores

        presentation7routes.ts-->Aca se definen los endpoints de la api (urls)

.env--> aca se guardan las variables de entorno (contraseñas, codigos secretos, api keys, llaves, direcciones url y credenciales)

package.json-->aca se muestran las dependencias instaladas y los scripts principales




## pasos para configurar swagger-documentacion
1-Ejecutar los comandos de instalacion

````npm install swagger-jsdoc swagger-ui-express````
````npm i --save-dev @types/swagger-jsdoc````
```npm i --save-dev @types/swagger-ui-express```

2-Crear el swagger.ts en la carpeta config con el siguiente contenido:

```ts 
import swaggerJSDoc, { Options } from "swagger-jsdoc";


const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API de Busroutes mobile",
        version: "1.0.0",
        description: "Documentación de la API para el software de gestión de taller automotriz.",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Servidor de desarrollo",
        },
    ],
};

const options: Options = {
    swaggerDefinition,
    apis: ["src/presentation/parada/*.ts"], // Ruta donde se encuentran las rutas documentadas
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
```


3-Aplicar el middleware de swagger en server.ts (donde se configuran la api de forma generla)
```// Middleware para Swagger```
```app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));```

4-descomentar la siguiente lineal en el tsconfig.json:
```    "resolveJsonModule": true,```

5-Comenzar a documentar cada endpoint especifico, EJ:
--Documentacion del endpoint de paradas cercanas (en paradasRoutes.ts)
```ts
/**
 * @swagger
 * /api/paradas/coordenadas:
 *   get:
 *     summary: Obtiene las coordenadas de todas las paradas.
 *     tags:
 *       - Paradas
 *     responses:
 *       200:
 *         description: Lista de coordenadas de paradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
```
!!/api/paradas/coordenadas se debe sustituir con el endpoint

LISTO!, ahora puedes probar tu documentacion en 
```localhost:[puerto]/api-docs```



import swaggerJSDoc, { Options } from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API de Busroutes mobile",
    version: "1.0.0",
    description:
      "Documentación de la API para el software de gestión de taller automotriz.",
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

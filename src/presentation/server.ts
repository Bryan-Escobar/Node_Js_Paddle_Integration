import express, { Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../config/swagger.js";

interface Options {
  port: number;
  // routes: Router;
}

export class Server {
  //Acá configuramos el server, que se encenderá en app.ts
  //Atributos de la clase server
  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;

  constructor(options: Options) {
    this.port = options.port;
    this.configure();
  }

  private async configure() {
    //* Middlewares
    this.app.use(express.json()); // Para parsear el cuerpo de las peticiones como JSON
    this.app.use(express.urlencoded({ extended: true })); // Para parsear el cuerpo de
    // Middleware para Swagger
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.use(express.json()); // raw
    this.app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded

    console.log("json y urlencoded configurados");
  }

  public setRoutes(router: Router) {
    this.app.use(router);
  }

  async start() {
    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  public close() {
    this.serverListener?.close();
  }
}

import { Router } from "express";
import { PaddleRoutes } from "./paddle-payments/routes";
import { AuthRoutes } from "./Auth/routes";


export class AppRoutes {
  static get routes(): Router {
    const router = Router();


    router.use('/api/paddle-payments', PaddleRoutes.routes);

    router.use('/api/auth', AuthRoutes.routes);

    router.get("/api/overview", (req, res) => {
      console.log("la api esta funcionando correctamente");
      res.status(200).json({
        message: "API is running",
      });
    });

    return router;
  }
}

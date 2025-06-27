import { Router } from "express";
import { PaddleController } from "./PaddleController";



export class PaddleRoutes {
  static get routes() {
    const router = Router();

    router.post("/webhook", PaddleController.PaddleWebhook);

    return router;
  }
}

import { Router } from "express";
import { AuthController } from "./AuthController";




export class AuthRoutes {
  static get routes() {
    const router = Router();
    const authController = new AuthController();
    router.post("/signup", authController.signUp);

    return router;
  }
}

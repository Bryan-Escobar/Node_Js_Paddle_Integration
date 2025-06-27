import { NextFunction, Request, Response } from "express";
import { JwtService } from "../services/jwt.service.js";

import { CustomError } from "../../domain/CustomError.js";
import { PrismaClient } from "@prisma/client";

export class AuthMiddleWare {
  static validarAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const prismaClient = new PrismaClient();

    try {
      const authorization = req.header("Authorization");
      if (!authorization) {
        res.status(401).json({ error: "No token provided" });
        return;
      }
      if (!authorization.startsWith("Bearer ")) {
        throw new CustomError("Invalid Bearer Token", 401);
      }

      //extrae el token del header
      const token = authorization.split(" ").at(1) || "";
      //si auhtorization es undefined, entonces el token será ' '

      const payload = await JwtService.validateToken<{
        id_usuario: number;
        email: string;
        rol: string;
      }>(token);

      console.log("token", token);
      if (!payload) {
        throw new CustomError("Token no válido", 401);
      }

      const usuarioEncontrado = await prismaClient.usuario.findFirst({
        where: { id_usuario: payload.id_usuario },
      });
      if (!usuarioEncontrado) {
        throw new CustomError("Usuario no encontrado", 401);
      }

      // Agregar información del usuario al request
      req.body = req.body || {};
      req.body.id_usuario = payload.id_usuario;
      req.body.email = payload.email;
      req.body.rol = payload.rol;

      next();
    } catch (error: any) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }

      // Manejar errores específicos de JWT
      if (error.name === "TokenExpiredError") {
        res.status(401).json({ error: "Token expirado" });
        return;
      }
      if (error.name === "JsonWebTokenError") {
        res.status(401).json({ error: "Token inválido" });
        return;
      }

      console.error("Error en middleware de autenticación:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  static validarRefreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const prismaClient = new PrismaClient();

    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        throw new CustomError("No refresh token provided", 401);
      }

      // Verificar que el token existe en la base de datos y no ha expirado
      const tokenEnDB = await prismaClient.refresh_tokens.findFirst({
        where: {
          token: refresh_token,
          expiracion: {
            gt: new Date(),
          },
        },
      });

      if (!tokenEnDB) {
        throw new CustomError("Refresh token inválido o expirado", 401);
      }

      // Agregar información necesaria al request
      req.body.id_usuario = tokenEnDB.id_usuario;
      next();
    } catch (error: any) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }

      console.error("Error en middleware de refresh token:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}

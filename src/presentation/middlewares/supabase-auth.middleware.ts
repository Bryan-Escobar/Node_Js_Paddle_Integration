import { NextFunction, Request, Response } from "express";
import { SupabaseService } from "../services/supabase.service.js";
import { CustomError } from "../../domain/CustomError.js";

export class SupabaseAuthMiddleware {
    static validarSessionToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const authorization = req.header("Authorization");
            if (!authorization) {
                res.status(401).json({ error: "No token provided" });
                return;
            }
            if (!authorization.startsWith("Bearer ")) {
                throw new CustomError("Invalid Bearer Token", 401);
            }

            // Extrae el token del header
            const token = authorization.split(" ").at(1) || "";

            // Valida el token con Supabase
            const user = await SupabaseService.validateSession(token);

            // Agregar información del usuario al request
            req.body = req.body || {};
            req.body.id_usuario = user.id;
            req.body.email = user.email;
            req.body.rol = user.user_metadata?.role || 'user';

            next();
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }

            console.error("Error en middleware de autenticación:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };
} 
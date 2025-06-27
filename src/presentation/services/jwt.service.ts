import jwt from "jsonwebtoken";
import { envs } from "../../config/envs.js";

export class JwtService {
  //este metodo genera un nuevo token apartir de un payload y ademas se le puede agregar una duracion al token
  static async generateToken(payload: any, duracion: any = "2h") {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        envs.JWT_SEED,
        { expiresIn: duracion },
        (err, token) => {
          if (err) {
            resolve(null);
            console.log("======>", err);
          }
          resolve(token);
        }
      );
    });
  }

  //en cualquier caso de error, el token se vuelve null y se retorna null
  static validateToken<T>(token: string): Promise<T | null> {
    const JWT_SEED = envs.JWT_SEED;
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) {
          return resolve(null);
        }
        return resolve(decoded as T);
      });
    });
    //T es un tipo generico, se puede usar para cualquier tipo de dato
  }
}

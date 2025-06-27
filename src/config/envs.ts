import "dotenv/config"; //Permite que la aplicacion cargue las variables de entorno del .env
import env from "env-var";

//Acá se importan las variables de entorno
export const envs = {
  PORT: env.get("PORT").required().asPortNumber(),
  JWT_SEED: env.get("JWT_SEED").required().asString(),
};

//env-var necesita de dotenv/config para funcionar

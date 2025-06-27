import { createServer } from "http";
import { envs } from "./config/envs.js";
import { AppRoutes } from "./presentation/routes.js";
import { Server } from "./presentation/server.js";

//Funcion anonima autoejecutable
//Esta funcion se ejecuta inmediatamente al correr el programa
(async () => {
  main();
})();

function main() {
  //Aca se crea un instancia de server y se enciende el servidor
  const server = new Server({
    port: envs.PORT,
  });

  //CreateServer es una funcion que node js nos ofrece para crear un servidor http
  const httpServer = createServer(server.app); //el servidor http tendra las mismas configuraciones que el servidor de express

  //Configuramos el puerto del servidor
  httpServer.listen(envs.PORT, () => {
    console.log(`Server running on port ${envs.PORT}`);
  });

  //Establecemos los endpoints del servidor
  server.setRoutes(AppRoutes.routes);
  //server.start();
}

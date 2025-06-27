import { createHash } from "crypto";

export class Sha2256Service {
  //Hashea strings usando sha256
  public static hashPassword(texto: string): string {
    const hash = createHash("sha256");
    hash.update(texto);
    return hash.digest("hex");
  }
}

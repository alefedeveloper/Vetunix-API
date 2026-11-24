import { avisarAntigo } from "../legado/sistema";

export const zapLegacySdk = {
  enviarMensagem(mensagem: string, destino: string): boolean {
    avisarAntigo(mensagem, destino);
    return true;
  }
};

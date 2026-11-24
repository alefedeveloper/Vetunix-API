import type { zapLegacySdk } from "../libs/zap-legacy-sdk";
import type { INotificador } from "./INotificador";

export class ZapAdapter implements INotificador {
  constructor(private readonly sdk: typeof zapLegacySdk) {}

  enviar(telefone: string, mensagem: string): void {
    let enviado = false;
    try {
      enviado = this.sdk.enviarMensagem(mensagem, "55" + telefone);
    } catch {
      enviado = false;
    }
    if (!enviado) {
      throw new Error("Falha ao notificar");
    }
  }
}

import type { ZapLegacySDK } from "../libs/zap-legacy-sdk";
import type { INotificador } from "./INotificador";

export class ZapAdapter implements INotificador {
  constructor(private readonly sdk: Pick<ZapLegacySDK, "dispararMsg">) {}

  enviar(telefone: string, mensagem: string): void {
    let enviado: boolean;
    try {
      enviado = this.sdk.dispararMsg("55" + telefone, { txt: mensagem }).ok;
    } catch {
      throw new Error("Falha ao notificar");
    }
    if (!enviado) {
      throw new Error("Falha ao notificar");
    }
  }
}

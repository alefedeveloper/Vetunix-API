import { ClinicaFacade } from "./facade/ClinicaFacade";
import { ZapLegacySDK } from "./libs/zap-legacy-sdk";
import { ZapAdapter } from "./notifications/ZapAdapter";
import { CalculadoraDePreco } from "./pricing/CalculadoraDePreco";
import { PrecoBanhoTosa, PrecoCirurgia, PrecoConsulta, PrecoVacina } from "./pricing/regras";
import { RepositorioEmMemoria } from "./repositories/RepositorioEmMemoria";

export function montarFacade(): ClinicaFacade {
  const regras = [new PrecoConsulta(), new PrecoVacina(), new PrecoCirurgia(), new PrecoBanhoTosa()];
  return new ClinicaFacade(
    new RepositorioEmMemoria(),
    new CalculadoraDePreco(regras),
    new ZapAdapter(new ZapLegacySDK("SIMULADO"))
  );
}

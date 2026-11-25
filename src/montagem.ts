import { ClinicaFacade } from "./facade/ClinicaFacade";
import { zapLegacySdk } from "./libs/zap-legacy-sdk";
import { ZapAdapter } from "./notifications/ZapAdapter";
import { CalculadoraDePreco } from "./pricing/CalculadoraDePreco";
import { CalculadoraDeTaxaCancelamento } from "./pricing/CalculadoraDeTaxaCancelamento";
import { DescontoPlanoPet } from "./pricing/DescontoPlanoPet";
import { PrecoBanhoTosa, PrecoCirurgia, PrecoConsulta, PrecoVacina } from "./pricing/regras";
import { RepositorioEmMemoria } from "./repositories/RepositorioEmMemoria";

export function montarFacade(): ClinicaFacade {
  const regras = [new PrecoConsulta(), new PrecoVacina(), new PrecoCirurgia(), new PrecoBanhoTosa()];
  return new ClinicaFacade(
    new RepositorioEmMemoria(),
    new DescontoPlanoPet(new CalculadoraDePreco(regras)),
    new ZapAdapter(zapLegacySdk),
    new CalculadoraDeTaxaCancelamento()
  );
}

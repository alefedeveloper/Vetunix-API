import { ClinicaFacade } from "./facade/ClinicaFacade";
import { zapLegacySdk } from "./libs/zap-legacy-sdk";
import { ZapAdapter } from "./notifications/ZapAdapter";
import { CalculadoraDePreco } from "./pricing/CalculadoraDePreco";
import { CalculadoraDeTaxaCancelamento } from "./pricing/CalculadoraDeTaxaCancelamento";
import { DescontoPlanoPet } from "./pricing/DescontoPlanoPet";
import { regraBanhoTosa, regraCirurgia, regraConsulta, regraVacina } from "./pricing/regras";
import { RepositorioEmMemoria } from "./repositories/RepositorioEmMemoria";

export function montarFacade(): ClinicaFacade {
  const regras = [regraConsulta, regraVacina, regraCirurgia, regraBanhoTosa];
  return new ClinicaFacade(
    new RepositorioEmMemoria(),
    new DescontoPlanoPet(new CalculadoraDePreco(regras)),
    new ZapAdapter(zapLegacySdk),
    new CalculadoraDeTaxaCancelamento()
  );
}

import { TipoAtendimento } from "../domain/TipoAtendimento";
import type { RegraDePreco } from "./RegraDePreco";

export class PrecoConsulta implements RegraDePreco {
  readonly tipoAtendimento = TipoAtendimento.CONSULTA;

  calcular(): number {
    return 120;
  }
}

export class PrecoVacina implements RegraDePreco {
  readonly tipoAtendimento = TipoAtendimento.VACINA;

  calcular(): number {
    return 80;
  }
}

export class PrecoCirurgia implements RegraDePreco {
  readonly tipoAtendimento = TipoAtendimento.CIRURGIA;

  calcular(): number {
    return 540;
  }
}

export class PrecoBanhoTosa implements RegraDePreco {
  readonly tipoAtendimento = TipoAtendimento.BANHO_TOSA;

  calcular(): number {
    return 65;
  }
}

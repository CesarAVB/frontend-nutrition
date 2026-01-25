export interface CriarConsultaDTO {
  avaliacaoFisica: CriarAvaliacaoFisicaDTO;
  questionarioEstiloVida: CriarQuestionarioEstiloVidaDTO;
}

export interface CriarAvaliacaoFisicaDTO {
  perimetroOmbro?: number;
  perimetroTorax?: number;
  perimetroCintura?: number;
  perimetroAbdominal?: number;
  perimetroQuadril?: number;

  perimetroBracoDireitoRelax?: number;
  perimetroBracoDireitoContr?: number;
  perimetroBracoEsquerdoRelax?: number;
  perimetroBracoEsquerdoContr?: number;

  perimetroAntebracoDireito?: number;
  perimetroAntebracoEsquerdo?: number;

  perimetroCoxaDireita?: number;
  perimetroCoxaEsquerda?: number;

  perimetroPanturrilhaDireita?: number;
  perimetroPanturrilhaEsquerda?: number;

  dobraTriceps?: number;
  dobraPeito?: number;
  dobraAxilarMedia?: number;
  dobraSubescapular?: number;
  dobraAbdominal?: number;
  dobraSupraIliaca?: number;
  dobraCoxa?: number;

  pesoAtual: number;
  massaMagra?: number;
  massaGorda?: number;
  percentualGordura?: number;
  imc?: number;
}

export interface CriarQuestionarioEstiloVidaDTO {
  objetivo: string;
  frequenciaTreino: string;
  tempoTreino?: string;

  cirurgias?: string;
  doencas?: string;
  historicoFamiliar?: string;
  medicamentos?: string;
  suplementos?: string;

  usoAnabolizantes: string;
  cicloAnabolizantes?: string;
  duracaoAnabolizantes?: string;

  fuma?: boolean;
  frequenciaAlcool: string;
  funcionamentoIntestino: string;
  qualidadeSono?: string;
  ingestaoAguaDiaria?: number;

  alimentosNaoGosta?: string;
  frutasPreferidas?: string;
  numeroRefeicoesDesejadas: number;
  horarioMaiorFome: string;

  pressaoArterial?: string;
  intolerancias?: string;
}

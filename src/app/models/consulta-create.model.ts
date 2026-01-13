// DTOs de CRIAÇÃO (POST /consultas)
// Usados no onSubmit do formulário

// ===============================
// Consulta
// ===============================
export interface CriarConsultaDTO {
  avaliacaoFisica: CriarAvaliacaoFisicaDTO;
  questionarioEstiloVida: CriarQuestionarioEstiloVidaDTO;
}

// ===============================
// Avaliação Física
// ===============================
export interface CriarAvaliacaoFisicaDTO {
  // Perímetros
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

  // Dobras cutâneas
  dobraTriceps?: number;
  dobraPeito?: number;
  dobraAxilarMedia?: number;
  dobraSubescapular?: number;
  dobraAbdominal?: number;
  dobraSupraIliaca?: number;
  dobraCoxa?: number;

  // Composição corporal
  pesoAtual: number;
  massaMagra?: number;
  massaGorda?: number;
  percentualGordura?: number;
  imc?: number;
}

// ===============================
// Questionário Estilo de Vida
// ===============================
export interface CriarQuestionarioEstiloVidaDTO {
  objetivo: string;
  frequenciaTreino: string;
  tempoTreino?: string;

  // Saúde
  cirurgias?: string;
  doencas?: string;
  historicoFamiliar?: string;
  medicamentos?: string;
  suplementos?: string;

  usoAnabolizantes: boolean;
  cicloAnabolizantes?: string;
  duracaoAnabolizantes?: string;

  // Hábitos
  fuma?: boolean;
  frequenciaAlcool: string;
  funcionamentoIntestino: string;
  qualidadeSono?: string;
  ingestaoAguaDiaria?: number;

  // Preferências
  alimentosNaoGosta?: string;
  frutasPreferidas?: string;
  numeroRefeicoesDesejadas: number;
  horarioMaiorFome: string;

  // Clínico
  pressaoArterial?: string;
  intolerancias?: string;
}

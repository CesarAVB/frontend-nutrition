export interface PacienteDTO {
  id?: number;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  sexo: 'MASCULINO' | 'FEMININO';
  telefoneWhatsapp: string;
  email?: string;
  prontuario?: string;
  totalConsultas?: number;
  ultimaConsulta?: string;
}

export interface ConsultaResumoDTO {
  id: number;
  pacienteId: number;
  nomePaciente: string;
  dataConsulta: string;
  peso?: number;
  percentualGordura?: number;
  objetivo?: string;
  temAvaliacaoFisica: boolean;
  temQuestionario: boolean;
  temFotos: boolean;
}

export interface ConsultaDetalhadaDTO {
  id: number;
  pacienteId: number;
  nomePaciente: string;
  dataConsulta: string;
  avaliacaoFisica?: AvaliacaoFisicaDTO;
  questionario?: QuestionarioEstiloVidaDTO;
  registroFotografico?: RegistroFotograficoDTO;
}

export interface AvaliacaoFisicaDTO {
  id?: number;
  consultaId: number;
  altura?: number;
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
  perimetroCoxa?: number;
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
  pesoAtual?: number;
  massaMagra?: number;
  massaGorda?: number;
  percentualGordura?: number;
  imc?: number;
}

export interface QuestionarioEstiloVidaDTO {
  id?: number;
  consultaId: number;
  objetivo?: string;
  frequenciaTreino?: string;
  tempoTreino?: string;
  cirurgias?: string;
  doencas?: string;
  historicoFamiliar?: string;
  medicamentos?: string;
  suplementos?: string;
  usoAnabolizantes?: string;
  cicloAnabolizantes?: string;
  duracaoAnabolizantes?: string;
  fuma?: boolean;
  frequenciaAlcool?: string;
  funcionamentoIntestino?: string;
  qualidadeSono?: string;
  ingestaoAguaDiaria?: number;
  alimentosNaoGosta?: string;
  frutasPreferidas?: string;
  numeroRefeicoesDesejadas?: number;
  horarioMaiorFome?: string;
  pressaoArterial?: string;
  intolerancias?: string;
}

export interface RegistroFotograficoDTO {
  id?: number;
  consultaId: number;
  fotoAnterior?: string;
  fotoPosterior?: string;
  fotoLateralEsquerda?: string;
  fotoLateralDireita?: string;
}

export interface ComparativoConsultasDTO {
  consultaInicial: ConsultaDetalhadaDTO;
  consultaFinal: ConsultaDetalhadaDTO;
  diferencas: DiferencasDTO;
}

export interface DiferencasDTO {
  diferencaPeso?: number;
  diferencaPercentualGordura?: number;
  diferencaMassaMagra?: number;
  diferencaMassaGorda?: number;
  diferencaImc?: number;
  diferencasPerimetros?: { [key: string]: number };
  diferencasDobras?: { [key: string]: number };
}
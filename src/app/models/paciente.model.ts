export interface Consulta {
  id: number;
  dataConsulta: string;
}

export interface Paciente {
  id: number;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  telefoneWhatsapp: string;
  email: string;
  consultas: Consulta[];
}

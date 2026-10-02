/* =====================================================================
   CDD CURITIBA: ESCALA MENSAL (muda todo mês)

   Mesmo formato de Paranaguá: cada mês publicado traz a data de
   publicação e as 2 folgas semanais de cada pessoa naquele mês.
   0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta,
   4 = Quinta, 5 = Sexta, 6 = Sábado
   ===================================================================== */

Escala.dados.unidades.push({
  id: "curitiba",
  nome: "CDD Curitiba",
  uf: "PR",
  tipoEscala: "mensal",
  coberturaMinima: { Motorista: 2, Ajudante: 2 },
  supervisor: { matricula: "94001", nome: "Cristiano Reis", funcao: "Supervisor" },

  equipe: [
    { matricula: "40001", nome: "Leonardo Dias",   funcao: "Motorista", rota: "Rota 401" },
    { matricula: "40002", nome: "Fábio Cardoso",   funcao: "Motorista", rota: "Rota 402" },
    { matricula: "40003", nome: "Ricardo Melo",    funcao: "Motorista", rota: "Rota 403" },
    { matricula: "40004", nome: "Samuel Vieira",   funcao: "Ajudante",  rota: "Rota 401" },
    { matricula: "40005", nome: "Igor Batista",    funcao: "Ajudante",  rota: "Rota 402" },
    { matricula: "40006", nome: "Henrique Lopes",  funcao: "Ajudante",  rota: "Rota 403" },
  ],

  meses: {
    "2026-09": {
      publicadaEm: "2026-08-28",
      folgas: { "40001": [6, 0], "40002": [1, 2], "40003": [3, 4], "40004": [0, 1], "40005": [2, 3], "40006": [4, 5] },
    },
    "2026-10": {
      publicadaEm: "2026-09-28",
      folgas: { "40001": [1, 2], "40002": [3, 4], "40003": [5, 6], "40004": [2, 3], "40005": [4, 5], "40006": [6, 0] },
    },
    "2026-11": {
      publicadaEm: "2026-09-30",
      folgas: { "40001": [3, 4], "40002": [5, 6], "40003": [0, 1], "40004": [4, 5], "40005": [6, 0], "40006": [1, 2] },
    },
  },

  ausencias: [
    { matricula: "40005", tipo: "atestado", inicio: "2026-10-08", fim: "2026-10-09" },
  ],
});

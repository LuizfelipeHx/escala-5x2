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

  equipe: [
    { matricula: "40001", pis: "13149044820", nome: "Leonardo Dias",   funcao: "Motorista", rota: "Rota 401" },
    { matricula: "40002", pis: "10583315710", nome: "Fábio Cardoso",   funcao: "Motorista", rota: "Rota 402" },
    { matricula: "40003", pis: "13520182830", nome: "Ricardo Melo",    funcao: "Motorista", rota: "Rota 403" },
    { matricula: "40004", pis: "14848461720", nome: "Samuel Vieira",   funcao: "Ajudante",  rota: "Rota 401" },
    { matricula: "40005", pis: "18059934533", nome: "Igor Batista",    funcao: "Ajudante",  rota: "Rota 402" },
    { matricula: "40006", pis: "13021762262", nome: "Henrique Lopes",  funcao: "Ajudante",  rota: "Rota 403" },
  ],

  meses: {
    "2026-07": {
      publicadaEm: "2026-06-26",
      folgas: { "40001": [1, 2], "40002": [3, 4], "40003": [5, 6], "40004": [6, 0], "40005": [1, 2], "40006": [3, 4] },
    },
    "2026-08": {
      publicadaEm: "2026-07-28",
      folgas: { "40001": [3, 4], "40002": [5, 6], "40003": [1, 2], "40004": [1, 2], "40005": [3, 4], "40006": [5, 6] },
    },
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

  // tipo: "ferias", "atestado", "afastamento" ou "falta" (injustificada). Datas AAAA-MM-DD (inclusive).
  ausencias: [
    { matricula: "40005", tipo: "falta",    inicio: "2026-08-17", fim: "2026-08-17" },
    { matricula: "40003", tipo: "falta",    inicio: "2026-09-11", fim: "2026-09-11" },
    { matricula: "40003", tipo: "falta",    inicio: "2026-09-25", fim: "2026-09-25" },
    { matricula: "40005", tipo: "atestado", inicio: "2026-10-08", fim: "2026-10-09" },
  ],
});

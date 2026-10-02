/* =====================================================================
   CDD PARANAGUÁ: ESCALA MENSAL (muda todo mês)

   Cada mês publicado tem a data de publicação e as folgas de cada
   pessoa naquele mês (2 dias da semana). Mês que não está aqui aparece
   como "a publicar" no site.
   0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta,
   4 = Quinta, 5 = Sexta, 6 = Sábado
   ===================================================================== */

Escala.dados.unidades.push({
  id: "paranagua",
  nome: "CDD Paranaguá",
  uf: "PR",
  tipoEscala: "mensal",
  coberturaMinima: { Motorista: 2, Ajudante: 2 },
  supervisor: { matricula: "93001", nome: "Juliana Prates", funcao: "Supervisora" },

  equipe: [
    { matricula: "30001", pis: "17028222134", nome: "Eduardo Farias", funcao: "Motorista", rota: "Rota 301" },
    { matricula: "30002", pis: "15354321402", nome: "Rodrigo Nunes",  funcao: "Motorista", rota: "Rota 302" },
    { matricula: "30003", pis: "11338555540", nome: "Vinícius Prado", funcao: "Motorista", rota: "Rota 303" },
    { matricula: "30004", pis: "10264173055", nome: "André Moura",    funcao: "Ajudante",  rota: "Rota 301" },
    { matricula: "30005", pis: "12445687090", nome: "Caio Freitas",   funcao: "Ajudante",  rota: "Rota 302" },
    { matricula: "30006", pis: "19741801770", nome: "Mateus Rocha",   funcao: "Ajudante",  rota: "Rota 303" },
  ],

  meses: {
    "2026-07": {
      publicadaEm: "2026-06-25",
      folgas: { "30001": [3, 4], "30002": [5, 6], "30003": [1, 2], "30004": [4, 5], "30005": [6, 0], "30006": [2, 3] },
    },
    "2026-08": {
      publicadaEm: "2026-07-27",
      folgas: { "30001": [5, 6], "30002": [1, 2], "30003": [3, 4], "30004": [2, 3], "30005": [4, 5], "30006": [6, 0] },
    },
    "2026-09": {
      publicadaEm: "2026-08-25",
      folgas: { "30001": [1, 2], "30002": [3, 4], "30003": [5, 6], "30004": [0, 1], "30005": [2, 3], "30006": [4, 5] },
    },
    "2026-10": {
      publicadaEm: "2026-09-25",
      folgas: { "30001": [0, 1], "30002": [2, 3], "30003": [4, 5], "30004": [6, 0], "30005": [1, 2], "30006": [3, 4] },
    },
    // Novembro ainda não publicado (de propósito, para mostrar o aviso).
  },

  // tipo: "ferias", "atestado", "afastamento" ou "falta" (injustificada). Datas AAAA-MM-DD (inclusive).
  ausencias: [
    { matricula: "30005", tipo: "falta",    inicio: "2026-07-13", fim: "2026-07-13" },
    { matricula: "30005", tipo: "falta",    inicio: "2026-07-27", fim: "2026-07-27" },
    { matricula: "30005", tipo: "falta",    inicio: "2026-08-24", fim: "2026-08-24" },
    { matricula: "30004", tipo: "atestado", inicio: "2026-09-01", fim: "2026-09-03" },
    { matricula: "30005", tipo: "falta",    inicio: "2026-09-14", fim: "2026-09-14" },
    { matricula: "30005", tipo: "falta",    inicio: "2026-09-21", fim: "2026-09-21" },
    { matricula: "30002", tipo: "ferias",   inicio: "2026-10-19", fim: "2026-10-30" },
  ],
});

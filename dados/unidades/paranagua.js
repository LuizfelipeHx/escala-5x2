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
    { matricula: "30001", nome: "Eduardo Farias", funcao: "Motorista", rota: "Rota 301" },
    { matricula: "30002", nome: "Rodrigo Nunes",  funcao: "Motorista", rota: "Rota 302" },
    { matricula: "30003", nome: "Vinícius Prado", funcao: "Motorista", rota: "Rota 303" },
    { matricula: "30004", nome: "André Moura",    funcao: "Ajudante",  rota: "Rota 301" },
    { matricula: "30005", nome: "Caio Freitas",   funcao: "Ajudante",  rota: "Rota 302" },
    { matricula: "30006", nome: "Mateus Rocha",   funcao: "Ajudante",  rota: "Rota 303" },
  ],

  meses: {
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

  ausencias: [
    { matricula: "30002", tipo: "ferias", inicio: "2026-10-19", fim: "2026-10-30" },
  ],
});

/* =====================================================================
   CDD MAUÁ: ESCALA ROTATIVA (muda toda semana)

   As 2 folgas são dias seguidos e avançam 1 dia a cada semana:
   Seg+Ter > Ter+Qua > Qua+Qui > Qui+Sex > Sex+Sáb > Sáb+Dom > Seg+Dom
   e então o ciclo recomeça (7 semanas).

   posicaoInicial = par de folgas da pessoa na semana de "inicioCiclo":
   0 = Seg+Ter, 1 = Ter+Qua, 2 = Qua+Qui, 3 = Qui+Sex,
   4 = Sex+Sáb, 5 = Sáb+Dom, 6 = Seg+Dom
   ===================================================================== */

Escala.dados.unidades.push({
  id: "maua",
  nome: "CDD Mauá",
  uf: "SP",
  tipoEscala: "rotativa",
  inicioCiclo: "2026-01-05", // precisa ser uma segunda-feira
  coberturaMinima: { Motorista: 2, Ajudante: 2 },

  equipe: [
    { matricula: "10001", pis: "14087560224", nome: "Carlos Mendes",   funcao: "Motorista", rota: "Rota 101", posicaoInicial: 0 },
    { matricula: "10002", pis: "16257008671", nome: "Rafael Souza",    funcao: "Motorista", rota: "Rota 102", posicaoInicial: 2 },
    { matricula: "10003", pis: "10312273476", nome: "Anderson Lima",   funcao: "Motorista", rota: "Rota 103", posicaoInicial: 4 },
    { matricula: "10004", pis: "17610961963", nome: "Marcos Oliveira", funcao: "Ajudante",  rota: "Rota 101", posicaoInicial: 1 },
    { matricula: "10005", pis: "15822688245", nome: "Thiago Ramos",    funcao: "Ajudante",  rota: "Rota 102", posicaoInicial: 3 },
    { matricula: "10006", pis: "11526969038", nome: "Felipe Costa",    funcao: "Ajudante",  rota: "Rota 103", posicaoInicial: 5 },
  ],

  // tipo: "ferias", "atestado", "afastamento" ou "falta" (injustificada). Datas AAAA-MM-DD (inclusive).
  // Falta só pode ser lançada em dia de trabalho da escala.
  ausencias: [
    { matricula: "10005", tipo: "falta",    inicio: "2026-07-06", fim: "2026-07-06" },
    { matricula: "10005", tipo: "falta",    inicio: "2026-08-03", fim: "2026-08-03" },
    { matricula: "10005", tipo: "falta",    inicio: "2026-08-31", fim: "2026-08-31" },
    { matricula: "10002", tipo: "falta",    inicio: "2026-09-04", fim: "2026-09-04" },
    { matricula: "10005", tipo: "falta",    inicio: "2026-09-14", fim: "2026-09-14" },
    { matricula: "10005", tipo: "atestado", inicio: "2026-10-01", fim: "2026-10-02" },
    { matricula: "10002", tipo: "ferias",   inicio: "2026-10-13", fim: "2026-10-26" },
  ],
});

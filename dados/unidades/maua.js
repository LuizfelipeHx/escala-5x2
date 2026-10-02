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
  supervisor: { matricula: "91001", nome: "Renata Alves", funcao: "Supervisora" },

  equipe: [
    { matricula: "10001", nome: "Carlos Mendes",   funcao: "Motorista", rota: "Rota 101", posicaoInicial: 0 },
    { matricula: "10002", nome: "Rafael Souza",    funcao: "Motorista", rota: "Rota 102", posicaoInicial: 2 },
    { matricula: "10003", nome: "Anderson Lima",   funcao: "Motorista", rota: "Rota 103", posicaoInicial: 4 },
    { matricula: "10004", nome: "Marcos Oliveira", funcao: "Ajudante",  rota: "Rota 101", posicaoInicial: 1 },
    { matricula: "10005", nome: "Thiago Ramos",    funcao: "Ajudante",  rota: "Rota 102", posicaoInicial: 3 },
    { matricula: "10006", nome: "Felipe Costa",    funcao: "Ajudante",  rota: "Rota 103", posicaoInicial: 5 },
  ],

  // tipo: "ferias" ou "atestado". Datas AAAA-MM-DD (inclusive).
  ausencias: [
    { matricula: "10005", tipo: "atestado", inicio: "2026-10-01", fim: "2026-10-02" },
    { matricula: "10002", tipo: "ferias",   inicio: "2026-10-13", fim: "2026-10-26" },
  ],
});

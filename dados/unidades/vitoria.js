/* =====================================================================
   CDD VITÓRIA: ESCALA FIXA (só muda quando entra funcionário novo)

   folgas = os 2 dias de folga da pessoa, todas as semanas.
   0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta,
   4 = Quinta, 5 = Sexta, 6 = Sábado
   ===================================================================== */

Escala.dados.unidades.push({
  id: "vitoria",
  nome: "CDD Vitória",
  uf: "ES",
  tipoEscala: "fixa",
  coberturaMinima: { Motorista: 2, Ajudante: 2 },

  equipe: [
    { matricula: "20001", pis: "10387722120", nome: "Bruno Teixeira", funcao: "Motorista", rota: "Rota 201", folgas: [6, 0] },
    { matricula: "20002", pis: "11293438965", nome: "Diego Martins",  funcao: "Motorista", rota: "Rota 202", folgas: [1, 2] },
    { matricula: "20003", pis: "11823283971", nome: "Jonas Ribeiro",  funcao: "Motorista", rota: "Rota 203", folgas: [3, 4] },
    { matricula: "20004", pis: "19238683126", nome: "Lucas Barbosa",  funcao: "Ajudante",  rota: "Rota 201", folgas: [0, 1] },
    { matricula: "20005", pis: "10905416020", nome: "Paulo Santos",   funcao: "Ajudante",  rota: "Rota 202", folgas: [2, 3] },
    { matricula: "20006", pis: "18219680240", nome: "Gustavo Pires",  funcao: "Ajudante",  rota: "Rota 203", folgas: [4, 5] },
  ],

  // tipo: "ferias", "atestado", "afastamento" ou "falta" (injustificada). Datas AAAA-MM-DD (inclusive).
  ausencias: [
    { matricula: "20005", tipo: "falta",    inicio: "2026-07-20", fim: "2026-07-20" },
    { matricula: "20002", tipo: "atestado", inicio: "2026-08-10", fim: "2026-08-12" },
    { matricula: "20005", tipo: "falta",    inicio: "2026-08-21", fim: "2026-08-21" },
    { matricula: "20005", tipo: "falta",    inicio: "2026-09-18", fim: "2026-09-18" },
    { matricula: "20006", tipo: "atestado", inicio: "2026-10-05", fim: "2026-10-06" },
    { matricula: "20002", tipo: "ferias",   inicio: "2026-11-03", fim: "2026-11-16" },
  ],
});

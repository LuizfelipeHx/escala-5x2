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
  supervisor: { matricula: "92001", nome: "Márcio Lopes", funcao: "Supervisor" },

  equipe: [
    { matricula: "20001", nome: "Bruno Teixeira", funcao: "Motorista", rota: "Rota 201", folgas: [6, 0] },
    { matricula: "20002", nome: "Diego Martins",  funcao: "Motorista", rota: "Rota 202", folgas: [1, 2] },
    { matricula: "20003", nome: "Jonas Ribeiro",  funcao: "Motorista", rota: "Rota 203", folgas: [3, 4] },
    { matricula: "20004", nome: "Lucas Barbosa",  funcao: "Ajudante",  rota: "Rota 201", folgas: [0, 1] },
    { matricula: "20005", nome: "Paulo Santos",   funcao: "Ajudante",  rota: "Rota 202", folgas: [2, 3] },
    { matricula: "20006", nome: "Gustavo Pires",  funcao: "Ajudante",  rota: "Rota 203", folgas: [4, 5] },
  ],

  ausencias: [
    { matricula: "20006", tipo: "atestado", inicio: "2026-10-05", fim: "2026-10-06" },
    { matricula: "20002", tipo: "ferias",   inicio: "2026-11-03", fim: "2026-11-16" },
  ],
});

/* =====================================================================
   DADOS FICTÍCIOS DO PROTÓTIPO
   Este é o único arquivo que precisa ser editado para mudar a escala.

   Como funciona a regra 5x2 com rodízio de domingo:
   - Cada pessoa tem uma FOLGA FIXA (toda semana, de segunda a sábado).
   - A equipe é dividida em grupos de domingo (A, B, C). A cada semana,
     um grupo folga no domingo, em rodízio.
   - Na semana em que o grupo da pessoa folga no domingo, as 2 folgas são:
     folga fixa + domingo.
   - Nas outras semanas, as 2 folgas são: folga fixa + FOLGA EXTRA.
   Resultado: sempre 5 dias de trabalho e 2 de folga, e 1 domingo de
   folga a cada 3 semanas.

   Dias da semana: 1 = segunda, 2 = terça ... 6 = sábado (0 = domingo
   é controlado pelo rodízio, não use nas folgas).
   ===================================================================== */

window.Escala = window.Escala || {};

Escala.dados = {
  config: {
    unidade: "CDD Exemplo",
    equipe: "Equipe de Entrega",
    // Segunda-feira em que o rodízio começa (semana 0 = grupo A).
    inicioRodizio: "2026-01-05",
    gruposDomingo: ["A", "B", "C"],
    // Mínimo de pessoas em operação por dia, por função.
    coberturaMinima: { Motorista: 3, Ajudante: 3 },
  },

  // Senha única de demonstração (login simulado, sem servidor).
  senhaDemo: "1234",

  equipe: [
    { id: 1,  matricula: "10001", nome: "Carlos Mendes",   funcao: "Motorista", rota: "Rota 101", folgaFixa: 1, folgaExtra: 4, grupoDomingo: "A" },
    { id: 2,  matricula: "10002", nome: "Rafael Souza",    funcao: "Motorista", rota: "Rota 102", folgaFixa: 2, folgaExtra: 5, grupoDomingo: "B" },
    { id: 3,  matricula: "10003", nome: "Anderson Lima",   funcao: "Motorista", rota: "Rota 103", folgaFixa: 3, folgaExtra: 6, grupoDomingo: "C" },
    { id: 4,  matricula: "10004", nome: "Bruno Teixeira",  funcao: "Motorista", rota: "Rota 104", folgaFixa: 4, folgaExtra: 1, grupoDomingo: "A" },
    { id: 5,  matricula: "10005", nome: "Diego Martins",   funcao: "Motorista", rota: "Rota 105", folgaFixa: 5, folgaExtra: 2, grupoDomingo: "B" },
    { id: 6,  matricula: "10006", nome: "Marcos Oliveira", funcao: "Ajudante",  rota: "Rota 101", folgaFixa: 2, folgaExtra: 6, grupoDomingo: "A" },
    { id: 7,  matricula: "10007", nome: "Thiago Ramos",    funcao: "Ajudante",  rota: "Rota 102", folgaFixa: 3, folgaExtra: 1, grupoDomingo: "B" },
    { id: 8,  matricula: "10008", nome: "Felipe Costa",    funcao: "Ajudante",  rota: "Rota 103", folgaFixa: 6, folgaExtra: 4, grupoDomingo: "C" },
    { id: 9,  matricula: "10009", nome: "Lucas Barbosa",   funcao: "Ajudante",  rota: "Rota 104", folgaFixa: 1, folgaExtra: 5, grupoDomingo: "C" },
    { id: 10, matricula: "10010", nome: "Jonas Ribeiro",   funcao: "Ajudante",  rota: "Rota 105", folgaFixa: 5, folgaExtra: 3, grupoDomingo: "A" },
  ],

  supervisores: [
    { matricula: "90001", nome: "Patrícia Nogueira", funcao: "Supervisora" },
  ],

  // tipo: "ferias" ou "atestado". Datas no formato AAAA-MM-DD (inclusive).
  ausencias: [
    { matricula: "10007", tipo: "atestado", inicio: "2026-10-01", fim: "2026-10-02" },
    { matricula: "10004", tipo: "ferias",   inicio: "2026-10-13", fim: "2026-10-26" },
    { matricula: "10005", tipo: "atestado", inicio: "2026-10-20", fim: "2026-10-21" },
    { matricula: "10008", tipo: "ferias",   inicio: "2026-11-09", fim: "2026-11-22" },
  ],

  feriados: [
    { data: "2026-10-12", nome: "Nossa Senhora Aparecida" },
    { data: "2026-11-02", nome: "Finados" },
    { data: "2026-11-15", nome: "Proclamação da República" },
    { data: "2026-11-20", nome: "Dia da Consciência Negra" },
    { data: "2026-12-25", nome: "Natal" },
    { data: "2027-01-01", nome: "Confraternização Universal" },
  ],
};

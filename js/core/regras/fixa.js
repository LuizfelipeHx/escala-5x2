/* Escala FIXA: as 2 folgas são sempre nos mesmos dias da semana. */
(function (E) {
  "use strict";

  const D = E.datas;

  E.regras.fixa = Object.freeze({
    nome: "Escala fixa",
    resumo: "As folgas são sempre nos mesmos dias. Só mudam quando entra alguém novo na equipe.",

    situacao: (p, d) => (p.folgas.includes(d.getDay()) ? "folga" : "trabalho"),

    descrever: (p) => [
      `Folgas fixas: ${D.nomesDias(p.folgas)}`,
      "Os dias não mudam de uma semana para outra.",
    ],

    validar(u) {
      return u.equipe
        .filter((p) => !E.regrasBase.duasFolgasValidas(p.folgas))
        .map((p) => `${p.nome}: informe 2 dias de folga diferentes (0 a 6).`);
    },
  });
})(window.Escala);

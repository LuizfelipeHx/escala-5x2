/* Escala ROTATIVA: as 2 folgas são dias seguidos e avançam 1 dia por
   semana, num ciclo de 7 semanas (Seg+Ter, Ter+Qua ... Sáb+Dom, Seg+Dom). */
(function (E) {
  "use strict";

  const D = E.datas;
  const CICLO = 7;
  const mod = (n, m) => ((n % m) + m) % m;

  function semanaDoCiclo(d, u) {
    return Math.floor(D.diasEntre(D.deIso(u.inicioCiclo), D.segundaDaSemana(d)) / 7);
  }

  // Folgas da pessoa na semana que contém "d", em dias da semana (0 = domingo).
  function folgasDaSemana(p, d, u) {
    const k = mod(p.posicaoInicial + semanaDoCiclo(d, u), CICLO); // 0 = segunda
    return [k, (k + 1) % CICLO].map((i) => (i + 1) % 7);
  }

  E.regras.rotativa = Object.freeze({
    nome: "Escala rotativa",
    resumo: "As folgas mudam toda semana: avançam 1 dia a cada semana.",
    folgasDaSemana,

    situacao: (p, d, u) => (folgasDaSemana(p, d, u).includes(d.getDay()) ? "folga" : "trabalho"),

    descrever(p, u, ref) {
      return [
        `Folgas nesta semana: ${D.nomesDias(folgasDaSemana(p, ref.hoje, u))}`,
        `Na próxima semana: ${D.nomesDias(folgasDaSemana(p, D.addDias(ref.hoje, 7), u))}`,
        `As folgas avançam 1 dia por semana (ciclo de ${CICLO} semanas).`,
      ];
    },

    validar(u) {
      const erros = [];
      if (!u.inicioCiclo || D.deIso(u.inicioCiclo).getDay() !== 1) erros.push("inicioCiclo precisa ser uma segunda-feira.");
      u.equipe.forEach((p) => {
        if (!Number.isInteger(p.posicaoInicial) || p.posicaoInicial < 0 || p.posicaoInicial >= CICLO) {
          erros.push(`${p.nome}: posicaoInicial deve ser de 0 a ${CICLO - 1}.`);
        }
      });
      return erros;
    },
  });
})(window.Escala);

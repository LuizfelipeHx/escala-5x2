/* Escala MENSAL: a supervisão publica, a cada mês, as 2 folgas semanais
   de cada pessoa. Mês não publicado fica "pendente" (a publicar). */
(function (E) {
  "use strict";

  const D = E.datas;
  const FORMATO_MES = /^\d{4}-\d{2}$/;

  const mesPublicado = (u, d) => u.meses[D.chaveMes(d)] || null;
  const nomeDoMes = (d) => D.MESES[d.getMonth()].toLowerCase();

  E.regras.mensal = Object.freeze({
    nome: "Escala mensal",
    resumo: "A escala muda todo mês e é publicada pela supervisão.",

    situacao(p, d, u) {
      const folgas = mesPublicado(u, d)?.folgas[p.matricula];
      if (!folgas) return "pendente";
      return folgas.includes(d.getDay()) ? "folga" : "trabalho";
    },

    descrever(p, u, ref) {
      const m = mesPublicado(u, ref.mes);
      if (!m) return [`A escala de ${nomeDoMes(ref.mes)} ainda não foi publicada.`, "A escala muda todo mês."];
      return [
        `Folgas em ${nomeDoMes(ref.mes)}: ${D.nomesDias(m.folgas[p.matricula])}`,
        `Publicada em ${D.curto(D.deIso(m.publicadaEm))}`,
        "A escala muda todo mês.",
      ];
    },

    publicacao(u, mesRef) {
      const m = mesPublicado(u, mesRef);
      return m ? { publicada: true, publicadaEm: D.deIso(m.publicadaEm) } : { publicada: false };
    },

    validar(u) {
      const erros = [];
      const matriculas = new Set(u.equipe.map((p) => p.matricula));
      Object.entries(u.meses || {}).forEach(([chave, m]) => {
        if (!FORMATO_MES.test(chave)) erros.push(`Mês "${chave}" fora do formato AAAA-MM.`);
        if (!m.publicadaEm) erros.push(`Mês ${chave} sem data de publicação.`);
        u.equipe.forEach((p) => {
          if (!E.regrasBase.duasFolgasValidas(m.folgas[p.matricula])) erros.push(`${p.nome}: folgas de ${chave} inválidas ou ausentes.`);
        });
        Object.keys(m.folgas).filter((x) => !matriculas.has(x))
          .forEach((x) => erros.push(`Mês ${chave}: matrícula ${x} não pertence à unidade.`));
      });
      return erros;
    },
  });
})(window.Escala);

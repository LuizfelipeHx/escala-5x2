/* Supervisão: escala do mês de qualquer colaborador da unidade. */
(function (E) {
  "use strict";

  E.telas.individual = {
    render(estado) {
      const D = E.datas, R = E.escala, U = E.ui;
      const u = U.unidadeAtual(estado);
      const p = u.equipe.find((x) => x.matricula === estado.pessoaMatricula) || u.equipe[0];
      const s = R.situacao(p, D.hoje());
      const opcoes = u.equipe.map((x) =>
        `<option value="${U.esc(x.matricula)}"${x.matricula === p.matricula ? " selected" : ""}>${U.esc(x.nome)} (${U.esc(x.funcao)})${x.desligamento ? " · desligado" : ""}</option>`).join("");

      return `
        <div class="seletor-pessoa">
          ${U.avatar(p.nome, s)}
          <select id="pessoa-sel" aria-label="Colaborador">${opcoes}</select>
          <span class="sub">${U.esc(p.funcao)} · ${U.esc(p.rota)} · matrícula ${U.esc(p.matricula)}</span>
        </div>
        <div class="resumo resumo-3">
          ${U.kpi("Hoje", U.chip(s))}
          ${U.kpisProximas(p)}
        </div>
        ${U.painelMensal(p, estado.mes)}`;
    },
  };
})(window.Escala);

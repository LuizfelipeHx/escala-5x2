/* Supervisão: quem está em operação e quem está fora num dia. */
(function (E) {
  "use strict";

  E.telas.hoje = {
    render(estado) {
      const D = E.datas, R = E.escala, U = E.ui;
      const u = U.unidadeAtual(estado);
      const d = estado.data;
      const lista = U.filtrarEquipe(estado);
      const emOperacao = lista.filter((p) => R.trabalha(p, d));
      const fora = lista.filter((p) => !R.trabalha(p, d));
      const contar = (tipos) => fora.filter((p) => tipos.includes(R.situacao(p, d))).length;
      const titulo = D.extenso(d) + (D.mesmoDia(d, D.hoje()) ? " (hoje)" : "");

      return `
        ${U.controlesPeriodo({
          ant: "dia-ant", prox: "dia-prox", hoje: "ir-hoje", titulo,
          extra: `<input type="date" id="data-sel" value="${D.iso(d)}" aria-label="Escolher data">`,
        })}
        ${U.avisoFeriado(d)}
        ${U.alertaCobertura(u, d)}
        <div class="resumo resumo-4">
          ${U.kpi("Equipe", lista.length)}
          ${U.kpi("Em operação", emOperacao.length, "k-trabalho")}
          ${U.kpi("De folga", contar(["folga"]), "k-folga")}
          ${U.kpi("Férias / atestado", contar(R.AUSENCIAS), "k-ferias")}
        </div>
        <div class="colunas">
          <div class="painel">
            <h3><span class="ponto s-trabalho"></span>Em operação (${emOperacao.length})</h3>
            ${emOperacao.map((p) => U.linhaPessoa(p, d, true)).join("") || U.vazio("Ninguém em operação neste dia.")}
          </div>
          <div class="painel">
            <h3><span class="ponto s-folga"></span>Fora ou a publicar (${fora.length})</h3>
            ${fora.map((p) => U.linhaPessoa(p, d, true)).join("") || U.vazio("Ninguém fora neste dia.")}
          </div>
        </div>`;
    },
  };
})(window.Escala);

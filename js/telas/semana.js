/* Supervisor: grade semanal (segunda a domingo). */
(function (E) {
  "use strict";

  E.telas.semana = {
    render(estado) {
      const D = E.datas, R = E.escala, U = E.ui;
      const seg = D.segundaDaSemana(estado.data);
      const dias = Array.from({ length: 7 }, (_, i) => D.addDias(seg, i));
      const hoje = D.hoje();
      const lista = U.filtrarEquipe(estado);
      const classeHoje = (d) => (D.mesmoDia(d, hoje) ? "hoje" : "");

      const cabecalho = dias.map((d) => {
        const f = R.feriado(d);
        return `<th class="${classeHoje(d)}">${D.DIAS[d.getDay()]}<small>${D.curto(d)}</small>
          ${d.getDay() === 0 ? `<small class="marcador">Folga grupo ${R.grupoDeFolgaNoDomingo(d)}</small>` : ""}
          ${f ? `<small class="marcador" title="${U.esc(f.nome)}">Feriado</small>` : ""}</th>`;
      }).join("");

      const linhas = lista.map((p) => `<tr>
        <td class="nome-col" data-id="${p.id}" title="Ver escala de ${U.esc(p.nome)}">${U.esc(p.nome)}
          <small>${U.esc(p.funcao)} · ${U.esc(p.rota)} · Grupo ${U.esc(p.grupoDomingo)}</small></td>
        ${dias.map((d) => `<td class="${classeHoje(d)}">${U.chip(R.situacao(p, d))}</td>`).join("")}
      </tr>`).join("");

      const coberturaPorDia = dias.map((d) => R.cobertura(d));
      const totais = R.funcoes().map((funcao, i) => `<tr class="total">
        <td>${U.esc(funcao)}s em operação</td>
        ${coberturaPorDia.map((cob) => {
          const c = cob[i];
          return `<td class="${c.ok ? "" : "ruim"}">${c.emOperacao} de ${c.total}</td>`;
        }).join("")}
      </tr>`).join("");

      return `
        ${U.controlesPeriodo({
          ant: "sem-ant", prox: "sem-prox", hoje: "ir-hoje", rotuloHoje: "Esta semana",
          rotuloAnt: "‹ Anterior", rotuloProx: "Próxima ›",
          titulo: `Semana de ${D.curto(dias[0])} a ${D.curto(dias[6])}`,
        })}
        <div class="tabela-wrap"><table>
          <thead><tr><th>Colaborador</th>${cabecalho}</tr></thead>
          <tbody>
            ${linhas || `<tr><td colspan="8">${U.vazio("Nenhum colaborador encontrado.")}</td></tr>`}
            ${totais}
          </tbody>
        </table></div>
        <p class="nota">As linhas de total consideram a equipe inteira, mesmo com filtro. Em vermelho: abaixo do mínimo.</p>
        ${U.legenda()}`;
    },
  };
})(window.Escala);

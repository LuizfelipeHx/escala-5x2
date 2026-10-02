/* Supervisor: cobertura mínima nos próximos dias e rodízio de domingo. */
(function (E) {
  "use strict";

  const DIAS_ANALISADOS = 28;
  const DOMINGOS_EXIBIDOS = 6;

  E.telas.cobertura = {
    DIAS_ANALISADOS,

    render(estado) {
      const D = E.datas, R = E.escala, U = E.ui;
      const inicio = estado.inicioCobertura;
      const dias = Array.from({ length: DIAS_ANALISADOS }, (_, i) => D.addDias(inicio, i));
      const linhas = dias.map((d) => ({ d, cob: R.cobertura(d) }));
      const comAlerta = linhas.filter((l) => l.cob.some((c) => !c.ok)).length;
      const minimos = E.dados.config.coberturaMinima;
      const regraTexto = R.funcoes().map((f) => `${minimos[f]} ${f.toLowerCase()}s`).join(" e ");

      const menor = (i) => Math.min(...linhas.map((l) => l.cob[i].emOperacao));
      const kpisFuncoes = R.funcoes().map((f, i) => {
        const m = menor(i);
        return U.kpi(`Menor nº de ${f.toLowerCase()}s`, m, m < minimos[f] ? "k-atestado" : "k-trabalho");
      }).join("");

      const ausentesDoDia = (d) => {
        const nomes = E.dados.equipe
          .filter((p) => R.AUSENCIAS.includes(R.situacao(p, d)))
          .map((p) => `${U.esc(U.primeiroNome(p.nome))} <em>(${R.SITUACOES[R.situacao(p, d)].rotulo.toLowerCase()})</em>`);
        return nomes.join(", ") || '<span class="apagado">Nenhuma</span>';
      };

      const tabela = linhas.map(({ d, cob }) => {
        const ok = cob.every((c) => c.ok);
        const f = R.feriado(d);
        return `<tr class="${ok ? "" : "linha-alerta"}">
          <td>${D.rotulo(d)}${f ? ` <span class="mini-tag" title="${U.esc(f.nome)}">Feriado</span>` : ""}</td>
          ${cob.map((c) => `<td class="${c.ok ? "" : "ruim"}">${c.emOperacao} de ${c.total}</td>`).join("")}
          <td class="esquerda">${ausentesDoDia(d)}</td>
          <td><span class="status ${ok ? "status-ok" : "status-ruim"}">${ok ? "OK" : "Abaixo do mínimo"}</span></td>
        </tr>`;
      }).join("");

      const primeiroDomingo = D.addDias(inicio, (7 - inicio.getDay()) % 7);
      const domingos = Array.from({ length: DOMINGOS_EXIBIDOS }, (_, i) => D.addDias(primeiroDomingo, i * 7));
      const rodizio = domingos.map((d) => {
        const g = R.grupoDeFolgaNoDomingo(d);
        return `<div class="rodizio-item">
          <div class="rodizio-data"><b>${D.curto(d)}</b><small>Domingo</small></div>
          <div class="rodizio-grupo">Grupo ${g}</div>
          <div class="rodizio-nomes">${R.membrosDoGrupo(g).map((p) => U.esc(U.primeiroNome(p.nome))).join(", ")}</div>
        </div>`;
      }).join("");

      return `
        ${U.controlesPeriodo({
          ant: "cob-ant", prox: "cob-prox", hoje: "ir-hoje", rotuloHoje: "A partir de hoje",
          rotuloAnt: "‹ Anterior", rotuloProx: "Próximo ›",
          titulo: `Cobertura de ${D.curto(dias[0])} a ${D.curto(dias[dias.length - 1])}`,
        })}
        <p class="nota">Mínimo por dia: ${regraTexto}. A conta considera a escala, férias e atestados.</p>
        <div class="resumo resumo-4">
          ${U.kpi("Dias analisados", DIAS_ANALISADOS)}
          ${U.kpi("Dias com alerta", comAlerta, comAlerta ? "k-atestado" : "k-trabalho")}
          ${kpisFuncoes}
        </div>
        <div class="tabela-wrap"><table>
          <thead><tr><th>Dia</th>${R.funcoes().map((f) => `<th>${U.esc(f)}s</th>`).join("")}<th class="esquerda">Férias e atestados</th><th>Situação</th></tr></thead>
          <tbody>${tabela}</tbody>
        </table></div>

        <h3 class="secao">Rodízio de domingo</h3>
        <p class="nota">Cada grupo folga 1 domingo a cada ${E.dados.config.gruposDomingo.length} semanas.</p>
        <div class="rodizio">${rodizio}</div>`;
    },
  };
})(window.Escala);

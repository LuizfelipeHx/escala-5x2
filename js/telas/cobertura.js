/* Supervisão: cobertura mínima nos próximos dias e domingos de folga. */
(function (E) {
  "use strict";

  const DIAS_ANALISADOS = 28;
  const DOMINGOS_EXIBIDOS = 6;
  const STATUS = {
    ok: { classe: "status-ok", texto: "OK" },
    baixa: { classe: "status-ruim", texto: "Abaixo do mínimo" },
    pendente: { classe: "status-pend", texto: "A publicar" },
  };

  E.telas.cobertura = {
    DIAS_ANALISADOS,

    render(estado) {
      const D = E.datas, R = E.escala, U = E.ui;
      const u = U.unidadeAtual(estado);
      const inicio = estado.inicioCobertura;
      const dias = Array.from({ length: DIAS_ANALISADOS }, (_, i) => D.addDias(inicio, i));
      const linhas = dias.map((d) => ({ d, cob: R.cobertura(u, d), status: R.statusDia(u, d) }));
      const contar = (st) => linhas.filter((l) => l.status === st).length;
      const regraTexto = R.funcoes(u).map((f) => `${u.coberturaMinima[f]} ${f.toLowerCase()}s`).join(" e ");

      // Menor cobertura só entre dias com escala publicada.
      const publicados = linhas.filter((l) => l.status !== "pendente");
      const kpisFuncoes = R.funcoes(u).map((f, i) => {
        if (!publicados.length) return U.kpi(`Menor nº de ${f.toLowerCase()}s`, "-");
        const m = Math.min(...publicados.map((l) => l.cob[i].emOperacao));
        return U.kpi(`Menor nº de ${f.toLowerCase()}s`, m, m < u.coberturaMinima[f] ? "k-atestado" : "k-trabalho");
      }).join("");

      const ausentesDoDia = (d) => {
        const nomes = u.equipe
          .filter((p) => R.AUSENCIAS.includes(R.situacao(p, d)))
          .map((p) => `${U.esc(U.primeiroNome(p.nome))} <em>(${R.SITUACOES[R.situacao(p, d)].rotulo.toLowerCase()})</em>`);
        return nomes.join(", ") || '<span class="apagado">Nenhuma</span>';
      };

      const tabela = linhas.map(({ d, cob, status }) => {
        const f = R.feriado(d);
        return `<tr class="${status === "baixa" ? "linha-alerta" : ""}">
          <td>${D.rotulo(d)}${f ? ` <span class="mini-tag" title="${U.esc(f.nome)}">Feriado</span>` : ""}</td>
          ${cob.map((c) => c.pendente
            ? '<td class="pend">-</td>'
            : `<td class="${c.ok ? "" : "ruim"}">${c.emOperacao} de ${c.total}</td>`).join("")}
          <td class="esquerda">${ausentesDoDia(d)}</td>
          <td><span class="status ${STATUS[status].classe}">${STATUS[status].texto}</span></td>
        </tr>`;
      }).join("");

      const domingos = Array.from({ length: DOMINGOS_EXIBIDOS }, (_, i) => D.addDias(R.proximoDomingo(inicio), i * 7));
      const cartoesDomingo = domingos.map((d) => {
        const pendente = R.statusDia(u, d) === "pendente";
        const folgam = R.folgamNoDia(u, d);
        const texto = pendente ? "Escala a publicar" : (U.nomesCurtos(folgam) || "Ninguém folga");
        return `<div class="rodizio-item">
          <div class="rodizio-data"><b>${D.curto(d)}</b><small>Domingo</small></div>
          <div class="rodizio-grupo">${pendente ? "-" : `${folgam.length} de folga`}</div>
          <div class="rodizio-nomes">${texto}</div>
        </div>`;
      }).join("");

      return `
        ${U.controlesPeriodo({
          ant: "cob-ant", prox: "cob-prox", hoje: "ir-hoje", rotuloHoje: "A partir de hoje",
          rotuloAnt: "‹ Anterior", rotuloProx: "Próximo ›",
          titulo: `Cobertura de ${D.curto(dias[0])} a ${D.curto(dias[dias.length - 1])}`,
        })}
        <p class="nota">Mínimo por dia: ${regraTexto}. A conta considera a escala, férias e atestados.</p>
        ${U.avisoSemDomingo(u)}
        <div class="resumo resumo-4">
          ${U.kpi("Dias com alerta", contar("baixa"), contar("baixa") ? "k-atestado" : "k-trabalho")}
          ${U.kpi("Dias a publicar", contar("pendente"), contar("pendente") ? "k-pendente" : "k-trabalho")}
          ${kpisFuncoes}
        </div>
        <div class="tabela-wrap"><table>
          <thead><tr><th>Dia</th>${R.funcoes(u).map((f) => `<th>${U.esc(f)}s</th>`).join("")}<th class="esquerda">Férias e atestados</th><th>Situação</th></tr></thead>
          <tbody>${tabela}</tbody>
        </table></div>

        <h3 class="secao">Quem folga nos próximos domingos</h3>
        <div class="rodizio">${cartoesDomingo}</div>`;
    },
  };
})(window.Escala);

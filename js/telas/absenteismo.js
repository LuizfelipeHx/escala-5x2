/* Liderança: análise histórica de absenteísmo e calendário de risco do mês.
   Só monta HTML; os números vêm de js/core/historico.js. */
(function (E) {
  "use strict";

  const NIVEIS = {
    normal:      { rotulo: "Normal",        icone: "●" },
    atencao:     { rotulo: "Atenção",       icone: "▲" },
    alto:        { rotulo: "Alta atenção",  icone: "◆" },
    "sem-dados": { rotulo: "Sem dados",     icone: "○" },
  };
  const PERIODOS = [3, 6, 12, 15];
  const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const mesCurto = (d) => `${MESES_CURTOS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;

  const selo = (nivel) =>
    `<span class="selo-risco r-${nivel}"><i aria-hidden="true">${NIVEIS[nivel].icone}</i>${NIVEIS[nivel].rotulo}</span>`;

  function alternador(estado) {
    const botao = (visao, texto) =>
      `<button class="alternador-op${estado.abs.visao === visao ? " ativo" : ""}" data-acao="abs-visao" data-visao="${visao}">${texto}</button>`;
    return `<div class="alternador" role="tablist">${botao("historico", "Histórico")}${botao("risco", "Calendário de risco")}</div>`;
  }

  function notaFonte() {
    const H = E.historico, D = E.datas;
    const p = H.periodo();
    return `<p class="nota">Histórico <b>fictício</b> de ${D.mesAno(p.inicio).toLowerCase()} a ${D.mesAno(p.fim).toLowerCase()}, no mesmo formato que a importação do AFDT vai gerar.
      Absenteísmo = <b>faltas injustificadas ÷ pessoas-dia previstas</b>. Folga, férias e afastamento não entram; atestado e falha de registro aparecem, mas não contam como falta.</p>`;
  }

  /* ---------- Histórico ---------- */
  function colunasMensais(meses) {
    const max = Math.max(...meses.map((m) => m.taxa ?? 0), 0.0001);
    const ultimo = meses[meses.length - 1];
    const maior = meses.reduce((a, b) => ((b.taxa ?? -1) > (a.taxa ?? -1) ? b : a), meses[0]);
    const U = E.ui;
    return `<div class="colunas-grafico" role="figure" aria-label="Absenteísmo por mês">
      ${meses.map((m) => {
        const rotular = m === ultimo || m === maior;
        return `<div class="coluna-item" title="${U.esc(`${E.datas.mesAno(m.mes)}: ${U.pct(m.taxa)} (${m.faltas} faltas em ${m.previstos} previstos)`)}">
          <span class="coluna-valor">${rotular ? U.pct(m.taxa) : ""}</span>
          <span class="coluna-trilho"><span class="coluna${m === ultimo ? " coluna-destaque" : ""}" style="height:${((m.taxa ?? 0) / max) * 100}%"></span></span>
          <span class="coluna-rotulo">${mesCurto(m.mes)}</span>
        </div>`;
      }).join("")}
    </div>`;
  }

  function tabelaMensal(meses) {
    const U = E.ui;
    const variacao = (v) => (v == null ? '<span class="apagado">-</span>' : `<span class="${v > 0 ? "sobe" : v < 0 ? "desce" : ""}">${U.pp(v)}</span>`);
    return `<div class="tabela-wrap"><table class="tabela-numeros">
      <thead><tr><th>Mês</th><th>Previstos</th><th>Faltas</th><th>Absenteísmo</th><th>vs mês anterior</th><th>vs mesmo mês do ano anterior</th><th>Atestados</th><th>Falhas de registro</th></tr></thead>
      <tbody>${[...meses].reverse().map((m) => `<tr>
        <td>${E.datas.mesAno(m.mes)}</td><td>${U.numero(m.previstos)}</td><td>${m.faltas}</td>
        <td><b>${U.pct(m.taxa)}</b></td><td>${variacao(m.varMesAnterior)}</td><td>${variacao(m.varAnoAnterior)}</td>
        <td>${m.atestados}</td><td>${m.falhas}</td></tr>`).join("")}</tbody>
    </table></div>
    <p class="nota">Variação em pontos percentuais (p.p.): em vermelho quando o absenteísmo subiu.</p>`;
  }

  function historico(estado, u) {
    const H = E.historico, U = E.ui, D = E.datas;
    const j = H.janela(estado.abs.meses);
    const r = H.resumoPeriodo(u, j);
    const opcoes = PERIODOS.map((n) => `<option value="${n}"${n === estado.abs.meses ? " selected" : ""}>Últimos ${n} meses</option>`).join("");

    const dias = H.porDiaSemana(u, j).map((x) => ({ rotulo: D.DIAS[x.dia], valor: x.taxa, detalhe: `${x.faltas} de ${U.numero(x.previstos)}` }));
    const semanas = H.porSemanaDoMes(u, j).map((x) => ({
      rotulo: `${x.semana}ª`, valor: x.taxa,
      detalhe: `${x.faltas} de ${U.numero(x.previstos)} · dias ${(x.semana - 1) * 7 + 1} a ${x.semana === 5 ? 31 : x.semana * 7}`,
    }));
    const meses = H.porMes(u);

    return `
      <div class="ctrl">
        <h2 class="titulo-data">Absenteísmo de ${D.mesAno(j.inicio).toLowerCase()} a ${D.mesAno(j.fim).toLowerCase()}</h2>
        <div class="ctrl-botoes"><select id="abs-periodo" aria-label="Período">${opcoes}</select></div>
      </div>
      <div class="resumo resumo-5">
        ${U.kpi("Pessoas-dia previstas", U.numero(r.previstos))}
        ${U.kpi("Faltas injustificadas", r.faltas, "k-falta")}
        ${U.kpi("Absenteísmo", U.pct(r.taxa), "", selo(H.faixa(r.taxa)))}
        ${U.kpi("Atestados (justificados)", r.atestados, "k-atestado")}
        ${U.kpi("Falhas de registro", r.falhas, "k-pendente", '<small class="kpi-nota">não contam como falta</small>')}
      </div>
      <div class="colunas">
        <div class="painel"><h3>Por dia da semana</h3>${U.barras(dias, "Absenteísmo por dia da semana")}</div>
        <div class="painel"><h3>Por semana do mês</h3>${U.barras(semanas, "Absenteísmo por semana do mês")}</div>
      </div>
      <h3 class="secao">Evolução mensal</h3>
      <div class="painel">${colunasMensais(meses)}</div>
      <h3 class="secao">Comparação mês a mês</h3>
      ${tabelaMensal(meses)}`;
  }

  /* ---------- Calendário de risco ---------- */
  function evidencia(u, risco) {
    const H = E.historico, U = E.ui, D = E.datas;
    const linhas = Object.entries(risco.sinais).map(([chave, s]) => `<tr class="${s.usado ? "" : "apagado"}">
      <td class="esquerda">${U.esc(s.descricao)}</td>
      <td>${s.faltas} de ${U.numero(s.previstos)}</td>
      <td><b>${U.pct(s.taxa)}</b></td>
      <td>${Math.round(H.PESOS[chave] * 100)}%</td>
      <td>${s.usado ? "Sim" : `Não (menos de ${H.MIN_PREVISTOS} previstos)`}</td>
    </tr>`).join("");

    const escala = risco.escalados == null
      ? "Escala deste dia ainda não publicada."
      : `${risco.escalados} pessoa(s) escalada(s)${risco.faltasEsperadas != null ? `, cerca de ${U.numero(risco.faltasEsperadas, 1)} falta esperada pela estimativa` : ""}.`;
    const comparacao = risco.razao != null
      ? `<b>${U.pct(risco.estimativa)}</b> estimado, ${U.numero(risco.razao, 1)}× a média da unidade (${U.pct(risco.base)} nos últimos ${H.MESES_BASE} meses).`
      : "Sem histórico suficiente para estimar este dia.";

    return `<div class="painel evidencia">
      <h3>${D.extenso(risco.data)} ${selo(risco.nivel)}</h3>
      <p>${comparacao}</p>
      <p>${escala}</p>
      <div class="tabela-wrap"><table class="tabela-numeros">
        <thead><tr><th class="esquerda">Histórico que sustenta a estimativa</th><th>Faltas / previstos</th><th>Taxa</th><th>Peso</th><th>Usado</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table></div>
      <p class="nota">É um sinal para planejar a cobertura e acompanhar causas, não uma previsão de quem vai faltar.</p>
    </div>`;
  }

  function risco(estado, u) {
    const H = E.historico, U = E.ui, D = E.datas;
    const mes = estado.abs.mesRisco;
    const dias = H.riscoDoMes(u, mes);
    const conta = (n) => dias.filter((x) => x.nivel === n).length;
    const pico = dias.filter((x) => x.razao != null).reduce((a, b) => (b.razao > (a?.razao ?? -1) ? b : a), null);
    const selecionado = dias.find((x) => D.iso(x.data) === estado.abs.diaRisco) || pico || dias[0];
    const hoje = D.hoje();

    let celulas = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((x) => `<div class="cal-cab">${x}</div>`).join("");
    celulas += '<div class="cal-fora"></div>'.repeat((mes.getDay() + 6) % 7);
    celulas += dias.map((x) => `<button class="risco-dia r-${x.nivel}${x === selecionado ? " selecionado" : ""}${D.mesmoDia(x.data, hoje) ? " hoje" : ""}"
        data-acao="risco-dia" data-dia="${D.iso(x.data)}" aria-label="${U.esc(`${D.extenso(x.data)}: ${NIVEIS[x.nivel].rotulo}`)}">
        <span class="cal-num">${x.data.getDate()}</span>
        <small><i aria-hidden="true">${NIVEIS[x.nivel].icone}</i><span class="risco-rotulo"> ${NIVEIS[x.nivel].rotulo}</span></small>
        <span class="risco-pct">${U.pct(x.estimativa)}</span>
      </button>`).join("");

    const pesos = `${Math.round(H.PESOS.diaSemana * 100)}%, ${Math.round(H.PESOS.semanaMes * 100)}% e ${Math.round(H.PESOS.anoAnterior * 100)}%`;
    return `
      ${U.controlesPeriodo({ ant: "risco-ant", prox: "risco-prox", hoje: "risco-hoje", rotuloHoje: "Próximo mês", titulo: `Risco de ausência · ${D.mesAno(mes)}` })}
      <p class="nota">Cada dia junta três sinais do histórico: o mesmo dia da semana nos últimos ${H.MESES_RECENTES} meses, a mesma semana do mês e o mesmo dia da semana no mesmo mês do ano anterior (pesos ${pesos}).
        A cor compara com a média da unidade: <b>Atenção</b> a partir de ${Math.round((H.LIMITES.atencao - 1) * 100)}% acima e <b>Alta atenção</b> a partir de ${Math.round((H.LIMITES.alto - 1) * 100)}% acima. Clique num dia para ver o histórico.</p>
      <div class="resumo resumo-4">
        ${U.kpi("Média da unidade (12 meses)", U.pct(dias[0]?.base))}
        ${U.kpi("Dias em alta atenção", conta("alto"), conta("alto") ? "k-atestado" : "")}
        ${U.kpi("Dias em atenção", conta("atencao"), conta("atencao") ? "k-folga" : "")}
        ${U.kpi("Maior risco", pico ? `${D.rotulo(pico.data)}` : "-", "", pico ? `<small class="kpi-nota">${U.pct(pico.estimativa)} estimado</small>` : "")}
      </div>
      <div class="cal cal-risco">${celulas}</div>
      <div class="legenda">${Object.keys(NIVEIS).map(selo).join("")}</div>
      ${selecionado ? evidencia(u, selecionado) : ""}`;
  }

  E.telas.absenteismo = {
    render(estado) {
      const u = E.ui.unidadeAtual(estado);
      return `${alternador(estado)}${notaFonte()}${estado.abs.visao === "risco" ? risco(estado, u) : historico(estado, u)}`;
    },
  };
})(window.Escala);

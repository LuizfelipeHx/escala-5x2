/* Liderança: absenteísmo em três visões, escolhidas pelo menu:
   histórico, calendário de risco do mês e por colaborador.
   Só monta HTML; os números vêm de js/core/historico.js. */
(function (E) {
  "use strict";

  const NIVEIS = {
    normal:         { rotulo: "Normal",       icone: "●" },
    atencao:        { rotulo: "Atenção",      icone: "▲" },
    alto:           { rotulo: "Alta atenção", icone: "◆" },
    "sem-dados":    { rotulo: "Sem dados",    icone: "○" },
    "poucos-dados": { rotulo: "Poucos dados", icone: "○" },
  };
  const PERIODOS = [3, 6, 12, 24];
  const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const mesCurto = (d) => `${MESES_CURTOS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
  const dataCompleta = (d) => `${E.datas.curto(d)}/${d.getFullYear()}`;
  const periodoTexto = (j) => `${E.datas.mesAno(j.inicio).toLowerCase()} a ${E.datas.mesAno(j.fim).toLowerCase()}`;

  const selo = (nivel) =>
    `<span class="selo-risco r-${nivel}"><i aria-hidden="true">${NIVEIS[nivel].icone}</i>${NIVEIS[nivel].rotulo}</span>`;

  const seletorPeriodo = (estado) =>
    `<select id="abs-periodo" aria-label="Período">${PERIODOS.map((n) =>
      `<option value="${n}"${n === estado.abs.meses ? " selected" : ""}>Últimos ${n} meses</option>`).join("")}</select>`;

  // Explicação comum às três visões (vai dentro de "Como calculamos").
  function baseDoCalculo() {
    const p = E.historico.periodo();
    return `<p><b>Fonte:</b> histórico <b>fictício</b> de ${periodoTexto(p)}, no mesmo formato que a importação do AFDT vai gerar.</p>
      <p><b>Absenteísmo</b> = faltas injustificadas ÷ pessoas-dia previstas. Folga, férias e afastamento não entram na conta; atestado e falha de registro aparecem, mas não contam como falta.</p>`;
  }

  /* ---------- Gráfico de colunas por mês ---------- */
  function colunasMensais(meses) {
    const U = E.ui;
    const max = Math.max(...meses.map((m) => m.taxa ?? 0), 0.0001);
    const ultimo = meses[meses.length - 1];
    const maior = meses.reduce((a, b) => ((b.taxa ?? -1) > (a.taxa ?? -1) ? b : a), meses[0]);
    // Com muitos meses: colunas finas e rótulo de um mês sim, outro não (o valor fica na dica e na tabela).
    return `<div class="colunas-grafico${meses.length > 16 ? " colunas-denso" : ""}" role="figure" aria-label="Absenteísmo por mês">
      ${meses.map((m) => `<div class="coluna-item" title="${U.esc(`${E.datas.mesAno(m.mes)}: ${U.pct(m.taxa)} (${m.faltas} faltas em ${m.previstos} previstos)`)}">
          <span class="coluna-valor">${m === ultimo || m === maior ? U.pct(m.taxa) : ""}</span>
          <span class="coluna-trilho"><span class="coluna${m === ultimo ? " coluna-destaque" : ""}" style="height:${((m.taxa ?? 0) / max) * 100}%"></span></span>
          <span class="coluna-rotulo">${mesCurto(m.mes)}</span>
        </div>`).join("")}
    </div>`;
  }

  /* ---------- Histórico ---------- */
  function tabelaMensal(meses) {
    const U = E.ui;
    const variacao = (v) => (v == null ? '<span class="apagado">-</span>' : `<span class="${v > 0 ? "sobe" : v < 0 ? "desce" : ""}">${U.pp(v)}</span>`);
    return `<div class="tabela-wrap"><table class="tabela-numeros">
      <thead><tr><th>Mês</th><th>Previstos</th><th>Faltas</th><th>Absenteísmo</th><th>vs mês anterior</th><th>vs mesmo mês do ano anterior</th><th>Atestados</th><th>Falhas de registro</th></tr></thead>
      <tbody>${[...meses].reverse().map((m) => `<tr>
        <td>${E.datas.mesAno(m.mes)}</td><td>${U.numero(m.previstos)}</td><td>${m.faltas}</td>
        <td><b>${U.pct(m.taxa)}</b></td><td>${variacao(m.varMesAnterior)}</td><td>${variacao(m.varAnoAnterior)}</td>
        <td>${m.atestados}</td><td>${m.falhas}</td></tr>`).join("")}</tbody>
    </table></div>`;
  }

  function historico(estado, u) {
    const H = E.historico, U = E.ui, D = E.datas;
    const j = H.janela(estado.abs.meses);
    const r = H.resumoPeriodo(u, j);
    const meses = H.porMes(u);
    const tendencia = U.sparkline(meses.slice(-12).map((m) => m.taxa), "Absenteísmo nos últimos 12 meses");
    const dias = H.porDiaSemana(u, j).map((x) => ({ rotulo: D.DIAS[x.dia], valor: x.taxa, detalhe: `${x.faltas} de ${U.numero(x.previstos)}` }));
    const semanas = H.porSemanaDoMes(u, j).map((x) => ({
      rotulo: `${x.semana}ª`, valor: x.taxa,
      detalhe: `${x.faltas} de ${U.numero(x.previstos)} · dias ${(x.semana - 1) * 7 + 1} a ${x.semana === 5 ? 31 : x.semana * 7}`,
    }));

    return `
      ${U.barraAcoes(`De ${periodoTexto(j)}`, seletorPeriodo(estado))}
      <div class="resumo resumo-5">
        ${U.kpi("Absenteísmo", U.pct(r.taxa), "k-destaque", `${selo(H.faixa(r.taxa))}${tendencia}`, "taxa")}
        ${U.kpi("Faltas", r.faltas, "k-falta", "", "ausencia")}
        ${U.kpi("Pessoas-dia previstas", U.numero(r.previstos), "", "", "calendario")}
        ${U.kpi("Atestados", r.atestados, "k-atestado", '<small class="kpi-nota">justificados</small>', "atestado")}
        ${U.kpi("Falhas de registro", r.falhas, "k-pendente", '<small class="kpi-nota">não contam como falta</small>', "falha")}
      </div>
      <div class="colunas">
        <div class="painel"><h3>Por dia da semana</h3>${U.barras(dias, "Absenteísmo por dia da semana")}</div>
        <div class="painel"><h3>Por semana do mês</h3>${U.barras(semanas, "Absenteísmo por semana do mês")}</div>
      </div>
      <h3 class="secao">Evolução mensal</h3>
      <div class="painel">${colunasMensais(meses)}</div>
      <h3 class="secao">Comparação mês a mês</h3>
      ${tabelaMensal(meses.filter((m) => m.mes >= D.inicioDoMes(j.inicio)))}
      ${U.comoCalculamos(`${baseDoCalculo()}
        <p><b>Semana do mês:</b> 1ª = dias 1 a 7, 2ª = dias 8 a 14 ... 5ª = dias 29 a 31.</p>
        <p><b>Variação</b> em pontos percentuais (p.p.): em vermelho quando o absenteísmo subiu.</p>
        <p><b>Semáforo do absenteísmo:</b> até 3% normal, de 3% a 5% atenção, acima de 5% alta atenção (sugestão inicial, a validar com o RH).</p>`)}`;
  }

  /* ---------- Calendário de risco ---------- */
  function evidencia(risco) {
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
      <p>${comparacao} ${escala}</p>
      <div class="tabela-wrap"><table class="tabela-numeros">
        <thead><tr><th class="esquerda">Histórico que sustenta a estimativa</th><th>Faltas / previstos</th><th>Taxa</th><th>Peso</th><th>Usado</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table></div>
      <p class="nota">Sinal para planejar a cobertura e acompanhar causas, não uma previsão de quem vai faltar.</p>
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

    const pct = (x) => Math.round(x * 100);
    return `
      ${U.controlesPeriodo({ ant: "risco-ant", prox: "risco-prox", hoje: "risco-hoje", rotuloHoje: "Próximo mês", titulo: D.mesAno(mes) })}
      <div class="resumo resumo-4">
        ${U.kpi("Dias em alta atenção", conta("alto"), conta("alto") ? "k-atestado" : "", "", "risco")}
        ${U.kpi("Dias em atenção", conta("atencao"), conta("atencao") ? "k-folga" : "", "", "risco")}
        ${U.kpi("Maior risco", pico ? D.rotulo(pico.data) : "-", "", pico ? `<small class="kpi-nota">${U.pct(pico.estimativa)} estimado</small>` : "", "calendario")}
        ${U.kpi("Média da unidade", U.pct(dias[0]?.base), "", '<small class="kpi-nota">últimos 12 meses</small>', "taxa")}
      </div>
      <div class="cal cal-risco">${celulas}</div>
      <div class="legenda">${Object.keys(NIVEIS).filter((n) => n !== "poucos-dados").map(selo).join("")}<span>Clique num dia para ver o histórico</span></div>
      ${selecionado ? evidencia(selecionado) : ""}
      ${U.comoCalculamos(`${baseDoCalculo()}
        <p><b>Estimativa do dia</b> = média ponderada de três sinais do histórico: o mesmo dia da semana nos últimos ${H.MESES_RECENTES} meses (${pct(H.PESOS.diaSemana)}%), a mesma semana do mês (${pct(H.PESOS.semanaMes)}%) e o mesmo dia da semana no mesmo mês do ano anterior (${pct(H.PESOS.anoAnterior)}%). Sinal com menos de ${H.MIN_PREVISTOS} pessoas-dia previstas é ignorado.</p>
        <p><b>Cor:</b> compara a estimativa com a média da unidade nos últimos ${H.MESES_BASE} meses. <b>Atenção</b> a partir de ${pct(H.LIMITES.atencao - 1)}% acima; <b>Alta atenção</b> a partir de ${pct(H.LIMITES.alto - 1)}% acima.</p>`)}`;
  }

  /* ---------- Por colaborador ---------- */
  function textoPadrao(pd) {
    const U = E.ui, D = E.datas;
    if (pd.tipo === "dia") return `Recorrência às ${D.DIAS_PLURAL[pd.dia]} (${pd.faltas} faltas; ${U.pct(pd.taxa)} contra ${U.pct(pd.equipe)} do restante da equipe nesse dia)`;
    return `Recorrência em ${D.MESES[pd.mes].toLowerCase()} (${pd.faltas} faltas em ${pd.anos} anos; ${U.pct(pd.taxa)} contra ${U.pct(pd.equipe)} do restante da equipe no mesmo mês)`;
  }
  // Versão curta para a tabela (o texto completo fica no detalhe e na dica).
  function textoPadraoCurto(pd) {
    const D = E.datas;
    return pd.tipo === "dia" ? `${D.NOMES_DIA[pd.dia]}s` : D.MESES[pd.mes];
  }

  function rotuloFiltro(f) {
    const D = E.datas;
    if (f.dia != null && f.mes != null) return `às ${D.DIAS_PLURAL[f.dia]} de ${D.MESES[f.mes].toLowerCase()}`;
    if (f.dia != null) return `às ${D.DIAS_PLURAL[f.dia]}`;
    if (f.mes != null) return `em ${D.MESES[f.mes].toLowerCase()}`;
    return "";
  }

  function detalhePessoa(u, p) {
    const H = E.historico, U = E.ui, D = E.datas;
    const det = H.detalheColaborador(u, p.matricula);
    const nivel = det.previstos < H.MIN_PREVISTOS_PESSOA ? "poucos-dados" : null;
    const periodos = det.episodios.length
      ? det.episodios.map((e) => `<span class="periodo">${e.dias === 1
          ? `${D.DIAS[e.inicio.getDay()]}, ${dataCompleta(e.inicio)}`
          : `${dataCompleta(e.inicio)} a ${dataCompleta(e.fim)} · ${e.dias} dias previstos`}</span>`).join("")
      : '<span class="apagado">Nenhuma falta no histórico.</span>';
    const atestados = det.atestados.length ? det.atestados.map((d) => `<span class="periodo periodo-neutro">${dataCompleta(d)}</span>`).join("") : '<span class="apagado">Nenhum.</span>';
    const dias = det.porDia.map((x) => ({ rotulo: D.DIAS[x.dia], valor: x.taxa, detalhe: `${x.faltas} de ${U.numero(x.previstos)}` }));

    return `<div class="painel detalhe-pessoa" id="detalhe-pessoa">
      <div class="detalhe-topo">
        ${U.avatar(p.nome)}
        <div><h3>${U.esc(p.nome)}${nivel ? ` ${selo(nivel)}` : ""}</h3><span class="sub">${U.esc(p.funcao)} · ${U.esc(p.rota)} · ${U.numero(det.previstos)} dias previstos${det.inicio ? ` desde ${dataCompleta(det.inicio)}` : ""}</span></div>
      </div>
      <div class="resumo resumo-4">
        ${U.kpi("Faltas", det.faltas, "k-falta", "", "ausencia")}
        ${U.kpi("Absenteísmo", U.pct(det.taxa), "", "", "taxa")}
        ${U.kpi("Episódios", det.episodios.length, "", '<small class="kpi-nota">faltas seguidas contam como 1</small>', "calendario")}
        ${U.kpi(`Bradford (${H.DIAS_RECENTES} dias)`, U.numero(det.bradford90), "", '<small class="kpi-nota">episódios² × dias</small>', "risco")}
      </div>
      <h4>Padrões encontrados</h4>
      ${det.padroes.length ? `<ul class="padroes">${det.padroes.map((pd) => `<li>${U.esc(textoPadrao(pd))}</li>`).join("")}</ul>` : '<p class="apagado">Nenhum padrão de recorrência encontrado.</p>'}
      <h4>Faltas por mês</h4>${colunasMensais(det.meses)}
      <h4>Por dia da semana</h4><div class="barras-estreitas">${U.barras(dias, `Faltas de ${p.nome} por dia da semana`)}</div>
      <h4>Datas das faltas</h4><div class="periodos">${periodos}</div>
      <h4>Atestados (não pontuam)</h4><div class="periodos">${atestados}</div>
      <p class="nota">Sinal para acompanhamento e conversa com a pessoa, não uma afirmação de que ela vai faltar.</p>
    </div>`;
  }

  function colaboradores(estado, u) {
    const H = E.historico, U = E.ui, D = E.datas;
    const j = H.janela(estado.abs.meses);
    const filtro = { dia: estado.abs.dia, mes: estado.abs.mes };
    const temFiltro = filtro.dia != null || filtro.mes != null;
    const { pessoas, foraDaAnalise, taxaEquipe90 } = H.porColaborador(u, j, filtro);
    const ordem = { alto: 0, atencao: 1, normal: 2, "poucos-dados": 3 };
    pessoas.sort((a, b) => (temFiltro
      ? b.filtro.faltas - a.filtro.faltas || (b.filtro.taxa ?? 0) - (a.filtro.taxa ?? 0)
      : ordem[a.nivel] - ordem[b.nivel] || (b.taxa ?? 0) - (a.taxa ?? 0)));
    const conta = (n) => pessoas.filter((x) => x.nivel === n).length;
    const opcoesDia = [1, 2, 3, 4, 5, 6, 0].map((d) => `<option value="${d}"${filtro.dia === d ? " selected" : ""}>${D.NOMES_DIA[d]}</option>`).join("");
    const opcoesMes = D.MESES.map((m, i) => `<option value="${i}"${filtro.mes === i ? " selected" : ""}>${m}</option>`).join("");
    const selecionada = pessoas.find((x) => x.pessoa.matricula === estado.abs.pessoa)?.pessoa;

    const linhas = pessoas.map((x) => `<tr class="linha-clicavel${x.pessoa === selecionada ? " selecionada" : ""}" data-acao="abs-pessoa" data-matricula="${U.esc(x.pessoa.matricula)}" tabindex="0">
      <td class="esquerda"><b>${U.esc(x.pessoa.nome)}</b><small>${U.esc(x.pessoa.funcao)} · ${U.numero(x.previstos)} dias previstos</small></td>
      <td><b>${U.pct(x.taxa)}</b><small>${x.faltas} ${x.faltas === 1 ? "falta" : "faltas"}</small></td>
      <td>${U.pct(x.taxa90)}<small>Bradford ${U.numero(x.bradford)}</small></td>
      <td class="col-tendencia">${U.sparkline(x.serie, `Tendência de ${x.pessoa.nome} nos últimos 12 meses`)}</td>
      ${temFiltro ? `<td class="col-filtro"><b>${x.filtro.faltas}</b> de ${U.numero(x.filtro.previstos)}<small>${U.pct(x.filtro.taxa)}</small></td>` : ""}
      <td class="esquerda">${x.padroes.length ? x.padroes.map((pd) => `<span class="tag-padrao" title="${U.esc(textoPadrao(pd))}">${U.esc(textoPadraoCurto(pd))}</span>`).join("") : '<span class="apagado">-</span>'}</td>
      <td>${selo(x.nivel)}</td>
    </tr>`).join("");

    return `
      ${U.barraAcoes(`De ${periodoTexto(j)}${temFiltro ? ` · faltas <b>${rotuloFiltro(filtro)}</b> em destaque` : ""}`,
        `${seletorPeriodo(estado)}
         <select id="abs-dia" aria-label="Dia da semana"><option value="">Todos os dias</option>${opcoesDia}</select>
         <select id="abs-mes" aria-label="Mês do ano"><option value="">Todos os meses</option>${opcoesMes}</select>`)}
      <div class="resumo resumo-4">
        ${U.kpi("Colaboradores analisados", pessoas.length, "", "", "pessoas")}
        ${U.kpi("Em alta atenção", conta("alto"), conta("alto") ? "k-atestado" : "", "", "risco")}
        ${U.kpi("Em atenção", conta("atencao"), conta("atencao") ? "k-folga" : "", "", "risco")}
        ${U.kpi("Fora da análise", foraDaAnalise, "k-pendente", '<small class="kpi-nota">desligados ou admitidos no período</small>', "ausencia")}
      </div>
      <div class="tabela-wrap"><table class="tabela-numeros tabela-colaboradores">
        <thead><tr><th class="esquerda">Colaborador</th><th>No período</th><th>Últimos ${H.DIAS_RECENTES} dias</th><th>Tendência (12 meses)</th>
          ${temFiltro ? `<th class="col-filtro">Faltas ${U.esc(rotuloFiltro(filtro))}</th>` : ""}<th class="esquerda">Recorrência</th><th>Sinal</th></tr></thead>
        <tbody>${linhas || `<tr><td colspan="7">${U.vazio("Nenhum colaborador com histórico no período.")}</td></tr>`}</tbody>
      </table></div>
      <p class="nota">Clique num colaborador para ver o histórico completo.</p>
      ${selecionada ? detalhePessoa(u, selecionada) : ""}
      ${U.comoCalculamos(`${baseDoCalculo()}
        <p><b>Quem entra:</b> só quem continua no CDD e já estava na operação no início do período.</p>
        <p><b>Sinal</b> (últimos ${H.DIAS_RECENTES} dias) = o pior entre: o absenteísmo da pessoa comparado com o da equipe (${U.pct(taxaEquipe90)} no mesmo período; atenção a partir de ${U.numero(H.RELATIVO_EQUIPE.atencao, 1)}×, alta a partir de ${H.RELATIVO_EQUIPE.alto}×, com pelo menos ${H.MIN_FALTAS_SINAL} faltas) e o <b>fator de Bradford</b> (episódios² × dias; atenção a partir de ${H.FAIXAS_BRADFORD.atencao}, alta a partir de ${H.FAIXAS_BRADFORD.alto}). Com menos de ${H.MIN_PREVISTOS_PESSOA} dias previstos no período: poucos dados.</p>
        <p><b>Recorrência</b> só aparece quando a pessoa falta pelo menos o dobro do restante da equipe naquele dia da semana ou mês e a chance de ser acaso (teste binomial) fica abaixo de ${U.numero(H.LIMITE_ACASO * 100, 1)}%. Num mês, também precisa ter faltas em pelo menos 2 anos.</p>`)}`;
  }

  const VISOES = { historico, risco, colaboradores };

  E.telas.absenteismo = {
    render(estado) {
      return (VISOES[estado.abs.visao] || historico)(estado, E.ui.unidadeAtual(estado));
    },
  };
})(window.Escala);

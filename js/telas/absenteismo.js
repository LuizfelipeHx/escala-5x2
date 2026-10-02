/* Liderança: análise histórica de absenteísmo e calendário de risco do mês.
   Só monta HTML; os números vêm de js/core/historico.js. */
(function (E) {
  "use strict";

  const NIVEIS = {
    normal:      { rotulo: "Normal",        icone: "●" },
    atencao:     { rotulo: "Atenção",       icone: "▲" },
    alto:        { rotulo: "Alta atenção",  icone: "◆" },
    "sem-dados": { rotulo: "Sem dados",     icone: "○" },
    "poucos-dados": { rotulo: "Poucos dados", icone: "○" },
  };
  const dataCompleta = (d) => `${E.datas.curto(d)}/${d.getFullYear()}`;
  const PERIODOS = [3, 6, 12, 24];
  const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const mesCurto = (d) => `${MESES_CURTOS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;

  const selo = (nivel) =>
    `<span class="selo-risco r-${nivel}"><i aria-hidden="true">${NIVEIS[nivel].icone}</i>${NIVEIS[nivel].rotulo}</span>`;

  function alternador(estado) {
    const botao = (visao, texto) =>
      `<button class="alternador-op${estado.abs.visao === visao ? " ativo" : ""}" data-acao="abs-visao" data-visao="${visao}">${texto}</button>`;
    return `<div class="alternador" role="tablist">${botao("historico", "Histórico")}${botao("risco", "Calendário de risco")}${botao("colaboradores", "Por colaborador")}</div>`;
  }

  const seletorPeriodo = (estado) =>
    `<select id="abs-periodo" aria-label="Período">${PERIODOS.map((n) =>
      `<option value="${n}"${n === estado.abs.meses ? " selected" : ""}>Últimos ${n} meses</option>`).join("")}</select>`;

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
    // Com muitos meses, colunas mais finas e rótulo de um mês sim, outro não (o valor de cada mês fica na dica e na tabela).
    return `<div class="colunas-grafico${meses.length > 16 ? " colunas-denso" : ""}" role="figure" aria-label="Absenteísmo por mês">
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

    const dias = H.porDiaSemana(u, j).map((x) => ({ rotulo: D.DIAS[x.dia], valor: x.taxa, detalhe: `${x.faltas} de ${U.numero(x.previstos)}` }));
    const semanas = H.porSemanaDoMes(u, j).map((x) => ({
      rotulo: `${x.semana}ª`, valor: x.taxa,
      detalhe: `${x.faltas} de ${U.numero(x.previstos)} · dias ${(x.semana - 1) * 7 + 1} a ${x.semana === 5 ? 31 : x.semana * 7}`,
    }));
    const meses = H.porMes(u);

    return `
      <div class="ctrl">
        <h2 class="titulo-data">Absenteísmo de ${D.mesAno(j.inicio).toLowerCase()} a ${D.mesAno(j.fim).toLowerCase()}</h2>
        <div class="ctrl-botoes">${seletorPeriodo(estado)}</div>
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

  /* ---------- Por colaborador ---------- */
  function textoPadrao(pd) {
    const U = E.ui, D = E.datas;
    if (pd.tipo === "dia") return `Recorrência às ${D.DIAS_PLURAL[pd.dia]} (${pd.faltas} faltas; ${U.pct(pd.taxa)} contra ${U.pct(pd.equipe)} do restante da equipe nesse dia)`;
    return `Recorrência em ${D.MESES[pd.mes].toLowerCase()} (${pd.faltas} faltas em ${pd.anos} anos; ${U.pct(pd.taxa)} contra ${U.pct(pd.equipe)} do restante da equipe no mesmo mês)`;
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
      <h3>${U.esc(p.nome)} <small>${U.esc(p.funcao)} · ${U.esc(p.rota)}</small>${nivel ? selo(nivel) : ""}</h3>
      <p class="nota">Histórico inteiro: <b>${U.numero(det.previstos)} dias previstos</b>${det.inicio ? ` desde ${dataCompleta(det.inicio)}` : ""}. Só faltas injustificadas contam.</p>
      <div class="resumo resumo-4">
        ${U.kpi("Faltas", det.faltas, "k-falta")}
        ${U.kpi("Absenteísmo", U.pct(det.taxa))}
        ${U.kpi("Episódios", det.episodios.length, "", '<small class="kpi-nota">faltas seguidas contam como 1</small>')}
        ${U.kpi(`Bradford (${H.DIAS_RECENTES} dias)`, U.numero(det.bradford90), "", '<small class="kpi-nota">episódios² × dias</small>')}
      </div>
      <h4>Padrões encontrados</h4>
      ${det.padroes.length ? `<ul class="padroes">${det.padroes.map((pd) => `<li>${U.esc(textoPadrao(pd))}</li>`).join("")}</ul>` : '<p class="apagado">Nenhum padrão de recorrência encontrado.</p>'}
      <p class="nota">Um padrão só aparece quando a pessoa falta pelo menos o dobro do restante da equipe naquele dia ou mês e a chance de ser acaso (teste binomial) fica abaixo de ${U.numero(H.LIMITE_ACASO * 100, 1)}%. Num mês, também precisa ter faltas em pelo menos 2 anos.</p>
      <h4>Faltas por mês</h4>${colunasMensais(det.meses)}
      <h4>Por dia da semana</h4><div class="barras-estreitas">${U.barras(dias, `Faltas de ${p.nome} por dia da semana`)}</div>
      <h4>Períodos das faltas</h4><div class="periodos">${periodos}</div>
      <h4>Atestados (não pontuam)</h4><div class="periodos">${atestados}</div>
      <p class="nota">É um sinal para acompanhamento e conversa com a pessoa, não uma afirmação de que ela vai faltar.</p>
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
      <td class="esquerda"><b>${U.esc(x.pessoa.nome)}</b><small>${U.esc(x.pessoa.funcao)} · ${U.esc(x.pessoa.rota)}</small></td>
      <td>${U.numero(x.previstos)}</td>
      <td>${x.faltas}</td>
      <td><b>${U.pct(x.taxa)}</b></td>
      <td>${x.episodios}</td>
      <td>${U.pct(x.taxa90)}</td>
      <td>${U.numero(x.bradford)}</td>
      ${temFiltro ? `<td class="col-filtro"><b>${x.filtro.faltas}</b> de ${U.numero(x.filtro.previstos)}<small>${U.pct(x.filtro.taxa)}</small></td>` : ""}
      <td class="esquerda">${x.padroes.length ? x.padroes.map((pd) => `<span class="tag-padrao">${U.esc(textoPadrao(pd))}</span>`).join("") : '<span class="apagado">-</span>'}</td>
      <td>${selo(x.nivel)}</td>
    </tr>`).join("");

    return `
      <div class="ctrl">
        <h2 class="titulo-data">Colaboradores de ${D.mesAno(j.inicio).toLowerCase()} a ${D.mesAno(j.fim).toLowerCase()}</h2>
        <div class="ctrl-botoes">
          ${seletorPeriodo(estado)}
          <select id="abs-dia" aria-label="Dia da semana"><option value="">Todos os dias</option>${opcoesDia}</select>
          <select id="abs-mes" aria-label="Mês do ano"><option value="">Todos os meses</option>${opcoesMes}</select>
        </div>
      </div>
      <p class="nota">Entram só os colaboradores que <b>continuam no CDD</b> e <b>já estavam na operação</b> no início do período.
        O sinal olha os <b>últimos ${H.DIAS_RECENTES} dias</b> e é o pior entre dois critérios:
        o absenteísmo da pessoa comparado com o da equipe (${U.pct(taxaEquipe90)} no mesmo período; atenção a partir de ${U.numero(H.RELATIVO_EQUIPE.atencao, 1)}×, alta a partir de ${H.RELATIVO_EQUIPE.alto}×, com pelo menos ${H.MIN_FALTAS_SINAL} faltas)
        e o fator de Bradford, que mede a concentração de episódios (atenção a partir de ${H.FAIXAS_BRADFORD.atencao}, alta a partir de ${H.FAIXAS_BRADFORD.alto}).
        Com menos de ${H.MIN_PREVISTOS_PESSOA} dias previstos no período: poucos dados.
        ${temFiltro ? `<br>Filtro ativo: a coluna destacada mostra as faltas <b>${rotuloFiltro(filtro)}</b>, e a lista está ordenada por ela.` : ""}</p>
      <div class="resumo resumo-4">
        ${U.kpi("Colaboradores analisados", pessoas.length)}
        ${U.kpi("Em alta atenção", conta("alto"), conta("alto") ? "k-atestado" : "")}
        ${U.kpi("Em atenção", conta("atencao"), conta("atencao") ? "k-folga" : "")}
        ${U.kpi("Fora da análise", foraDaAnalise, "k-pendente", '<small class="kpi-nota">desligados ou admitidos no período</small>')}
      </div>
      <div class="tabela-wrap"><table class="tabela-numeros tabela-colaboradores">
        <thead><tr><th class="esquerda">Colaborador</th><th>Dias previstos</th><th>Faltas</th><th>Absenteísmo</th><th>Episódios</th><th>Absenteísmo ${H.DIAS_RECENTES} dias</th><th>Bradford ${H.DIAS_RECENTES} dias</th>
          ${temFiltro ? `<th class="col-filtro">Faltas ${U.esc(rotuloFiltro(filtro))}</th>` : ""}<th class="esquerda">Padrões</th><th>Sinal</th></tr></thead>
        <tbody>${linhas || `<tr><td colspan="10">${U.vazio("Nenhum colaborador com histórico no período.")}</td></tr>`}</tbody>
      </table></div>
      <p class="nota">Clique num colaborador para ver o histórico completo.</p>
      ${selecionada ? detalhePessoa(u, selecionada) : ""}`;
  }

  const VISOES = { historico, risco, colaboradores };

  E.telas.absenteismo = {
    render(estado) {
      const u = E.ui.unidadeAtual(estado);
      return `${alternador(estado)}${notaFonte()}${(VISOES[estado.abs.visao] || historico)(estado, u)}`;
    },
  };
})(window.Escala);

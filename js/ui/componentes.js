/* Peças de interface reaproveitadas pelas telas. Cada função devolve HTML.
   Todo texto vindo dos dados passa por esc() antes de ir para a tela. */
(function (E) {
  "use strict";

  const D = E.datas;
  const R = E.escala;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const iniciais = (nome) => nome.split(" ").filter(Boolean).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const primeiroNome = (nome) => nome.split(" ")[0];

  const avatar = (nome, situacao = "neutro") => `<div class="avatar s-${situacao}">${esc(iniciais(nome))}</div>`;
  const chip = (situacao) => `<span class="chip s-${situacao}">${R.SITUACOES[situacao].rotulo}</span>`;
  const vazio = (texto) => `<div class="vazio">${esc(texto)}</div>`;

  // valorHtml e detalheHtml já devem vir escapados.
  const kpi = (rotulo, valorHtml, variante = "", detalheHtml = "") =>
    `<div class="kpi ${variante}"><small>${esc(rotulo)}</small><b>${valorHtml}</b>${detalheHtml ? `<span>${detalheHtml}</span>` : ""}</div>`;

  function controlesPeriodo({ ant, prox, hoje, titulo, rotuloHoje = "Hoje", rotuloAnt = "‹", rotuloProx = "›", extra = "" }) {
    return `<div class="ctrl">
      <h2 class="titulo-data">${esc(titulo)}</h2>
      <div class="ctrl-botoes">
        <button class="btn" data-acao="${ant}" aria-label="Anterior">${rotuloAnt}</button>
        <button class="btn" data-acao="${prox}" aria-label="Próximo">${rotuloProx}</button>
        ${extra}
        <button class="btn btn-primario" data-acao="${hoje}">${esc(rotuloHoje)}</button>
      </div>
    </div>`;
  }

  function filtrarEquipe(estado) {
    const q = estado.busca.trim().toLowerCase();
    return E.dados.equipe.filter((p) =>
      (!estado.funcao || p.funcao === estado.funcao) &&
      (!q || p.nome.toLowerCase().includes(q) || p.rota.toLowerCase().includes(q) || p.matricula.includes(q)));
  }

  /* ---------- Avisos ---------- */
  function alertaCobertura(d) {
    const falhas = R.cobertura(d).filter((c) => !c.ok);
    if (!falhas.length) return "";
    return `<div class="aviso aviso-erro"><b>Cobertura abaixo do mínimo</b>
      ${falhas.map((c) => `<span>${esc(c.funcao)}s: ${c.emOperacao} em operação (mínimo ${c.minimo})</span>`).join("")}</div>`;
  }

  function avisoFeriado(d) {
    const f = R.feriado(d);
    return f ? `<div class="aviso aviso-feriado"><b>Feriado: ${esc(f.nome)}</b><span>Operação conforme programação da unidade.</span></div>` : "";
  }

  /* ---------- Pessoa em lista ---------- */
  function linhaPessoa(p, d, clicavel) {
    const s = R.situacao(p, d);
    const detalhe = s === "trabalho"
      ? `Próxima folga: ${D.rotulo(R.proximaFolga(p, d))}`
      : `Volta em: ${D.rotulo(R.proximoRetorno(p, d))}`;
    return `<div class="pessoa${clicavel ? " clicavel" : ""}"${clicavel ? ` data-id="${p.id}" title="Ver escala de ${esc(p.nome)}"` : ""}>
      ${avatar(p.nome, s)}
      <div class="pessoa-info"><div class="nome">${esc(p.nome)}</div><div class="sub">${esc(p.funcao)} · ${esc(p.rota)}</div></div>
      <div class="pessoa-dir">${s !== "trabalho" ? chip(s) : ""}<span class="tag">${detalhe}</span></div>
    </div>`;
  }

  /* ---------- Calendário e painel mensal ---------- */
  function legenda() {
    return `<div class="legenda">
      ${Object.keys(R.SITUACOES).map(chip).join("")}
      <span><i class="marca-feriado"></i> Feriado</span>
      <span><i class="marca-hoje"></i> Hoje</span>
    </div>`;
  }

  function calendario(p, mesRef) {
    const hoje = D.hoje();
    let html = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((x) => `<div class="cal-cab">${x}</div>`).join("");
    html += '<div class="cal-fora"></div>'.repeat((mesRef.getDay() + 6) % 7);
    for (let i = 1; i <= D.diasNoMes(mesRef); i++) {
      const d = new Date(mesRef.getFullYear(), mesRef.getMonth(), i);
      const s = R.situacao(p, d);
      const f = R.feriado(d);
      html += `<div class="cal-dia s-${s}${D.mesmoDia(d, hoje) ? " hoje" : ""}"${f ? ` title="Feriado: ${esc(f.nome)}"` : ""}>
        <span class="cal-num">${i}${f ? '<i class="marca-feriado"></i>' : ""}</span>
        <small>${R.SITUACOES[s].rotulo}</small>
      </div>`;
    }
    return `<div class="cal">${html}</div>`;
  }

  function kpisProximas(p) {
    const hoje = D.hoje();
    return kpi("Próxima folga", D.rotulo(R.proximaFolga(p, hoje)), "k-folga") +
           kpi("Próximo domingo de folga", D.rotulo(R.proximoDomingoDeFolga(p, hoje)), "k-folga");
  }

  function painelMensal(p, mesRef) {
    const r = R.resumoMes(p, mesRef);
    const semanas = E.dados.config.gruposDomingo.length;
    return `<div class="regra">
        <span><b>Folga fixa:</b> ${D.DIAS_LONGO[p.folgaFixa]}</span>
        <span><b>Folga extra:</b> ${D.DIAS_LONGO[p.folgaExtra]} (nas semanas sem domingo)</span>
        <span><b>Grupo de domingo:</b> ${esc(p.grupoDomingo)} (1 domingo de folga a cada ${semanas} semanas)</span>
      </div>
      ${controlesPeriodo({ ant: "mes-ant", prox: "mes-prox", hoje: "mes-hoje", rotuloHoje: "Este mês", titulo: D.mesAno(mesRef) })}
      <div class="resumo resumo-4">
        ${kpi("Dias de trabalho", r.trabalho, "k-trabalho")}
        ${kpi("Folgas", r.folga, "k-folga")}
        ${kpi("Férias", r.ferias, "k-ferias")}
        ${kpi("Atestado", r.atestado, "k-atestado")}
      </div>
      ${calendario(p, mesRef)}
      ${legenda()}`;
  }

  E.ui = Object.assign(E.ui || {}, {
    esc, iniciais, primeiroNome, avatar, chip, vazio, kpi, controlesPeriodo, filtrarEquipe,
    alertaCobertura, avisoFeriado, linhaPessoa, legenda, calendario, kpisProximas, painelMensal,
  });
})(window.Escala);

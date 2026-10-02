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
  const nomesCurtos = (pessoas) => pessoas.map((p) => esc(primeiroNome(p.nome))).join(", ");

  const avatar = (nome, situacao = "neutro") => `<div class="avatar s-${situacao}">${esc(iniciais(nome))}</div>`;
  const chip = (situacao) => `<span class="chip s-${situacao}">${R.SITUACOES[situacao].rotulo}</span>`;
  const chipTipo = (u) => `<span class="chip-tipo tipo-${u.tipoEscala}">${esc(R.tipoDe(u).nome)}</span>`;
  const vazio = (texto) => `<div class="vazio">${esc(texto)}</div>`;

  /* ---------- Números ---------- */
  const numero = (n, casas = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const pct = (taxa) => (taxa == null ? "-" : `${numero(taxa * 100, 1)}%`);
  // Variação em pontos percentuais, com sinal: "+0,4 p.p."
  const pp = (delta) => (delta == null ? "-" : `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${numero(Math.abs(delta) * 100, 1)} p.p.`);

  /* ---------- Gráfico de barras horizontais (uma série) ----------
     itens: [{ rotulo, valor (0 a 1), detalhe }]. A maior barra fica em destaque;
     os valores aparecem na ponta das barras e na dica ao passar o mouse. */
  function barras(itens, titulo) {
    const max = Math.max(...itens.map((i) => i.valor ?? 0), 0.0001);
    const maior = itens.reduce((a, b) => ((b.valor ?? -1) > (a.valor ?? -1) ? b : a), itens[0]);
    return `<div class="grafico" role="figure" aria-label="${esc(titulo)}">
      ${itens.map((i) => `<div class="barra-linha" title="${esc(`${i.rotulo}: ${pct(i.valor)} (${i.detalhe})`)}">
        <span class="barra-rotulo">${esc(i.rotulo)}</span>
        <span class="barra-trilho"><span class="barra${i === maior ? " barra-destaque" : ""}" style="width:${((i.valor ?? 0) / max) * 100}%"></span></span>
        <span class="barra-valor"><b>${pct(i.valor)}</b><small>${esc(i.detalhe)}</small></span>
      </div>`).join("")}
    </div>`;
  }

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

  const unidadeAtual = (estado) => R.unidade(estado.unidadeId);

  // "dias": se informado, só quem está no quadro em pelo menos um desses dias.
  function filtrarEquipe(estado, dias = null) {
    const q = estado.busca.trim().toLowerCase();
    return unidadeAtual(estado).equipe.filter((p) =>
      (!dias || dias.some((d) => R.ativoEm(p, d))) &&
      (!estado.funcao || p.funcao === estado.funcao) &&
      (!q || p.nome.toLowerCase().includes(q) || p.rota.toLowerCase().includes(q) || p.matricula.includes(q)));
  }

  /* ---------- Faixa da unidade (nome + tipo de escala) ---------- */
  // "visiveis": ids das unidades que o usuário pode ver (seletor se houver mais de uma).
  function faixaUnidade(u, visiveis) {
    const nome = visiveis.length > 1
      ? `<select id="unidade-sel" aria-label="Unidade">${R.unidades().filter((x) => visiveis.includes(x.id)).map((x) =>
          `<option value="${x.id}"${x.id === u.id ? " selected" : ""}>${esc(x.nome)} (${esc(x.uf)})</option>`).join("")}</select>`
      : `<b class="faixa-nome">${esc(u.nome)} <small>${esc(u.uf)}</small></b>`;
    return `<div class="faixa">${nome}${chipTipo(u)}<span class="faixa-resumo">${esc(R.tipoDe(u).resumo)}</span></div>`;
  }

  /* ---------- Avisos ---------- */
  function alertaCobertura(u, d) {
    const cob = R.cobertura(u, d);
    if (cob.some((c) => c.pendente)) {
      return `<div class="aviso aviso-info"><b>Escala deste dia ainda não publicada</b><span>A supervisão publica a escala mensal antes do início do mês.</span></div>`;
    }
    const falhas = cob.filter((c) => !c.ok);
    if (!falhas.length) return "";
    return `<div class="aviso aviso-erro"><b>Cobertura abaixo do mínimo</b>
      ${falhas.map((c) => `<span>${esc(c.funcao)}s: ${c.emOperacao} em operação (mínimo ${c.minimo})</span>`).join("")}</div>`;
  }

  function avisoFeriado(d) {
    const f = R.feriado(d);
    return f ? `<div class="aviso aviso-feriado"><b>Feriado: ${esc(f.nome)}</b><span>Operação conforme programação da unidade.</span></div>` : "";
  }

  function avisoSemDomingo(u) {
    const lista = R.semDomingoDeFolga(u, D.hoje());
    if (!lista.length) return "";
    return `<div class="aviso aviso-atencao"><b>Sem domingo de folga nas próximas ${R.SEMANAS_DOMINGO} semanas</b>
      <span>${nomesCurtos(lista)}. Confirme com o RH a regra de revezamento aos domingos.</span></div>`;
  }

  /* ---------- Pessoa em lista ---------- */
  function detalheSituacao(p, d, s) {
    if (s === "trabalho") return `Próxima folga: ${D.rotulo(R.proximaFolga(p, d))}`;
    if (s === "pendente") return "Escala a publicar";
    if (s === "inativo") return "Fora do quadro";
    return `Volta em: ${D.rotulo(R.proximoRetorno(p, d))}`;
  }

  function linhaPessoa(p, d, clicavel) {
    const s = R.situacao(p, d);
    return `<div class="pessoa${clicavel ? " clicavel" : ""}"${clicavel ? ` data-id="${esc(p.matricula)}" title="Ver escala de ${esc(p.nome)}"` : ""}>
      ${avatar(p.nome, s)}
      <div class="pessoa-info"><div class="nome">${esc(p.nome)}</div><div class="sub">${esc(p.funcao)} · ${esc(p.rota)}</div></div>
      <div class="pessoa-dir">${s !== "trabalho" ? chip(s) : ""}<span class="tag">${detalheSituacao(p, d, s)}</span></div>
    </div>`;
  }

  /* ---------- Calendário e painel mensal ---------- */
  function legenda(u) {
    const situacoes = ["trabalho", "folga", "ferias", "atestado", "afastamento", "falta"].concat(u.tipoEscala === "mensal" ? ["pendente"] : []);
    return `<div class="legenda">
      ${situacoes.map(chip).join("")}
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
    const u = R.unidadeDe(p);
    const r = R.resumoMes(p, mesRef);
    const regra = R.descreverRegra(p, { hoje: D.hoje(), mes: mesRef });
    return `<div class="regra">${chipTipo(u)}${regra.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      ${controlesPeriodo({ ant: "mes-ant", prox: "mes-prox", hoje: "mes-hoje", rotuloHoje: "Este mês", titulo: D.mesAno(mesRef) })}
      <div class="resumo resumo-4">
        ${kpi("Dias de trabalho", r.trabalho, "k-trabalho")}
        ${kpi("Folgas", r.folga, "k-folga")}
        ${kpi("Ausências", r.ferias + r.atestado + r.afastamento + r.falta, "k-ferias")}
        ${r.pendente ? kpi("A publicar", r.pendente, "k-pendente") : kpi("Domingos de folga", r.domingos, "k-folga")}
      </div>
      ${calendario(p, mesRef)}
      ${legenda(u)}`;
  }

  E.ui = Object.assign(E.ui || {}, {
    esc, iniciais, primeiroNome, nomesCurtos, avatar, chip, chipTipo, vazio, kpi, controlesPeriodo,
    numero, pct, pp, barras,
    unidadeAtual, filtrarEquipe, faixaUnidade, alertaCobertura, avisoFeriado, avisoSemDomingo,
    detalheSituacao, linhaPessoa, legenda, calendario, kpisProximas, painelMensal,
  });
})(window.Escala);

/* Histórico de absenteísmo e risco por dia. Sem DOM.

   1. OCORRÊNCIAS DE PONTO: { matricula, data, tipo } com tipo "falta",
      "atestado" ou "falha_registro". Hoje vêm do gerador fictício; a
      importação do AFDT vai produzir exatamente este formato.
   2. APURAÇÃO: cada dia em que a pessoa estava prevista para trabalhar
      vira um registro (presença, falta, atestado ou falha de registro).
      Não entram: folga, férias, afastamento, fora do quadro e escala a publicar.
   3. ANÁLISES: agrupamentos e o risco estimado de cada dia.

   Absenteísmo = faltas injustificadas ÷ pessoas-dia previstas. */
(function (E) {
  "use strict";

  const D = E.datas;
  const R = E.escala;
  const cfg = () => E.configHistorico;

  const MIN_PREVISTOS = 15;          // abaixo disso o sinal não é usado
  const MESES_RECENTES = 3;          // janela dos sinais "recentes"
  const MESES_BASE = 12;             // janela da média da unidade
  const PESOS = { diaSemana: 0.4, semanaMes: 0.3, anoAnterior: 0.3 };
  const LIMITES = { atencao: 1.15, alto: 1.4 }; // estimativa ÷ média da unidade
  // Semáforo da taxa geral (sugestão inicial; validar com o RH): até 3% normal,
  // de 3% a 5% atenção, acima de 5% alto.
  const FAIXAS = { atencao: 0.03, alto: 0.05 };
  const faixa = (taxa) => (taxa == null ? "sem-dados" : taxa > FAIXAS.alto ? "alto" : taxa >= FAIXAS.atencao ? "atencao" : "normal");

  const semanaDoMes = (d) => Math.ceil(d.getDate() / 7); // 1 a 5

  /* ---------- 1. Gerador fictício determinístico ---------- */
  function hash(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // Número entre 0 e 1 sempre igual para a mesma semente (mulberry32).
  function aleatorio(semente) {
    let t = (semente + 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function chanceDeFalta(u, p, d) {
    const c = cfg();
    const mes = d.getMonth() + 1;
    let chance = c.taxaFalta * (c.fatorUnidade[u.id] ?? 1) * c.fatorDiaSemana[d.getDay()] *
      (c.fatorSemanaMes[semanaDoMes(d)] ?? 1) * (c.fatorMes[mes] ?? 1);
    const r = c.recorrentes[p.matricula];
    if (r && (r.diaSemana === d.getDay() || r.mes === mes)) chance *= r.fator;
    return chance;
  }

  function gerarOcorrencias() {
    const c = cfg();
    const ocorrencias = [];
    const inicio = D.deIso(c.inicio), fim = D.deIso(c.fim);
    R.unidades().forEach((u) => u.equipe.forEach((p) => {
      for (let d = inicio; d <= fim; d = D.addDias(d, 1)) {
        if (R.situacao(p, d) !== "trabalho") continue; // só dia escalado e sem ausência lançada
        const sorteio = aleatorio(hash(`${c.semente}|${p.matricula}|${D.iso(d)}`));
        const falta = chanceDeFalta(u, p, d);
        let tipo = null;
        if (sorteio < falta) tipo = "falta";
        else if (sorteio < falta + c.taxaAtestado) tipo = "atestado";
        else if (sorteio < falta + c.taxaAtestado + c.taxaFalhaRegistro) tipo = "falha_registro";
        if (tipo) ocorrencias.push({ matricula: p.matricula, data: D.iso(d), tipo });
      }
    }));
    return ocorrencias;
  }

  /* ---------- 2. Apuração (com cache por versão dos dados) ---------- */
  let cache = { versao: -1, ocorrencias: null, porUnidade: new Map() };
  function garantirCache() {
    if (cache.versao === R.versaoDados()) return;
    cache = { versao: R.versaoDados(), ocorrencias: null, porUnidade: new Map() };
  }

  function ocorrencias() {
    garantirCache();
    if (!cache.ocorrencias) cache.ocorrencias = gerarOcorrencias();
    return cache.ocorrencias;
  }

  // Registros de dias previstos de uma unidade, no período do histórico.
  function registros(u) {
    garantirCache();
    if (cache.porUnidade.has(u.id)) return cache.porUnidade.get(u.id);
    const ponto = new Map(ocorrencias().map((o) => [`${o.matricula}|${o.data}`, o.tipo]));
    const inicio = D.deIso(cfg().inicio), fim = D.deIso(cfg().fim);
    const lista = [];
    u.equipe.forEach((p) => {
      for (let d = inicio; d <= fim; d = D.addDias(d, 1)) {
        const s = R.situacao(p, d);
        let tipo = null;
        if (s === "trabalho") tipo = ponto.get(`${p.matricula}|${D.iso(d)}`) || "presenca";
        // Falta e atestado lançados no cadastro contam se o dia era de trabalho na escala.
        else if ((s === "falta" || s === "atestado") && R.situacaoNaEscala(p, d) === "trabalho") tipo = s;
        if (!tipo) continue;
        lista.push({ matricula: p.matricula, data: d, dia: d.getDay(), semana: semanaDoMes(d), mes: D.chaveMes(d), tipo });
      }
    });
    cache.porUnidade.set(u.id, lista);
    return lista;
  }

  /* ---------- 3. Análises ---------- */
  function resumir(lista) {
    const r = { previstos: lista.length, faltas: 0, atestados: 0, falhas: 0 };
    lista.forEach((x) => {
      if (x.tipo === "falta") r.faltas++;
      else if (x.tipo === "atestado") r.atestados++;
      else if (x.tipo === "falha_registro") r.falhas++;
    });
    r.taxa = r.previstos ? r.faltas / r.previstos : null;
    return r;
  }

  const periodo = () => ({ inicio: D.deIso(cfg().inicio), fim: D.deIso(cfg().fim) });

  // Últimos "meses" completos até o fim do histórico.
  function janela(meses, ate = periodo().fim) {
    const inicio = D.addMeses(D.inicioDoMes(ate), -(meses - 1));
    return { inicio, fim: ate };
  }
  const dentro = (lista, j) => lista.filter((x) => x.data >= j.inicio && x.data <= j.fim);

  function resumoPeriodo(u, j) { return resumir(dentro(registros(u), j)); }

  function porDiaSemana(u, j) {
    const lista = dentro(registros(u), j);
    return [1, 2, 3, 4, 5, 6, 0]
      .map((dia) => ({ dia, ...resumir(lista.filter((x) => x.dia === dia)) }))
      .filter((x) => x.dia !== 0 || x.previstos > 0); // domingo só se alguém trabalha
  }

  function porSemanaDoMes(u, j) {
    const lista = dentro(registros(u), j);
    return [1, 2, 3, 4, 5].map((semana) => ({ semana, ...resumir(lista.filter((x) => x.semana === semana)) }));
  }

  // Cada mês do histórico, com variação contra o mês anterior e o mesmo mês do ano anterior.
  function porMes(u) {
    const lista = registros(u);
    const meses = [];
    for (let m = D.inicioDoMes(periodo().inicio); m <= periodo().fim; m = D.addMeses(m, 1)) meses.push(m);
    const mapa = new Map(meses.map((m) => [D.chaveMes(m), resumir(lista.filter((x) => x.mes === D.chaveMes(m)))]));
    const taxa = (chave) => mapa.get(chave)?.taxa ?? null;
    return meses.map((m) => {
      const r = mapa.get(D.chaveMes(m));
      const anterior = taxa(D.chaveMes(D.addMeses(m, -1)));
      const anoAnterior = taxa(D.chaveMes(D.addMeses(m, -12)));
      return {
        mes: m, ...r,
        varMesAnterior: r.taxa != null && anterior != null ? r.taxa - anterior : null,
        varAnoAnterior: r.taxa != null && anoAnterior != null ? r.taxa - anoAnterior : null,
      };
    });
  }

  /* ---------- Risco estimado de um dia ---------- */
  function sinal(lista, descricao) {
    const r = resumir(lista);
    return { ...r, descricao, usado: r.previstos >= MIN_PREVISTOS };
  }

  function riscoDoDia(u, d) {
    const todos = registros(u);
    const recentes = dentro(todos, janela(MESES_RECENTES));
    const mesmoMesAnoPassado = D.chaveMes(new Date(d.getFullYear() - 1, d.getMonth(), 1));
    const nomeDia = D.DIAS_LONGO[d.getDay()].toLowerCase();

    const sinais = {
      diaSemana: sinal(recentes.filter((x) => x.dia === d.getDay()),
        `${D.DIAS_LONGO[d.getDay()]} nos últimos ${MESES_RECENTES} meses`),
      semanaMes: sinal(recentes.filter((x) => x.semana === semanaDoMes(d)),
        `${semanaDoMes(d)}ª semana do mês nos últimos ${MESES_RECENTES} meses`),
      anoAnterior: sinal(todos.filter((x) => x.mes === mesmoMesAnoPassado && x.dia === d.getDay()),
        `${nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1)} em ${D.mesAno(D.deIso(`${mesmoMesAnoPassado}-01`)).toLowerCase()}`),
    };

    const usados = Object.entries(sinais).filter(([, s]) => s.usado);
    const pesoTotal = usados.reduce((t, [k]) => t + PESOS[k], 0);
    const estimativa = usados.length ? usados.reduce((t, [k, s]) => t + PESOS[k] * s.taxa, 0) / pesoTotal : null;
    const base = resumir(dentro(todos, janela(MESES_BASE))).taxa;

    let nivel = "sem-dados";
    if (estimativa != null && base) {
      const razao = estimativa / base;
      nivel = razao >= LIMITES.alto ? "alto" : razao >= LIMITES.atencao ? "atencao" : "normal";
    }

    // Quem está escalado nesse dia (null se a escala ainda não foi publicada).
    const ativos = R.equipeAtiva(u, d);
    const situacoes = ativos.map((p) => R.situacao(p, d));
    const escalados = situacoes.includes("pendente") ? null : situacoes.filter((s) => s === "trabalho").length;

    return {
      data: d, nivel, estimativa, base, sinais,
      razao: estimativa != null && base ? estimativa / base : null,
      escalados,
      faltasEsperadas: escalados != null && estimativa != null ? escalados * estimativa : null,
    };
  }

  /* ---------- Por colaborador ---------- */
  const MIN_PREVISTOS_PESSOA = 40;   // abaixo disso: "poucos dados"
  const DIAS_RECENTES = 90;
  // Fator de Bradford (S² × D): faixas de ACOMPANHAMENTO, não disciplinares.
  const FAIXAS_BRADFORD = { atencao: 50, alto: 125 };
  // Absenteísmo da pessoa comparado com a equipe nos mesmos 90 dias.
  // Abaixo de 3 faltas não vira alerta (1 ou 2 faltas isoladas são ruído).
  const RELATIVO_EQUIPE = { atencao: 1.5, alto: 2 };
  const MIN_FALTAS_SINAL = 3;
  const ordemNivel = { normal: 0, atencao: 1, alto: 2 };
  function faixaRelativa(r, taxaEquipe) {
    if (r.faltas < MIN_FALTAS_SINAL || !taxaEquipe || r.taxa == null) return "normal";
    const razao = r.taxa / taxaEquipe;
    return razao >= RELATIVO_EQUIPE.alto ? "alto" : razao >= RELATIVO_EQUIPE.atencao ? "atencao" : "normal";
  }

  // Episódio = faltas em dias previstos seguidos (folga no meio não quebra).
  function episodios(listaPessoa) {
    const ordenada = [...listaPessoa].sort((a, b) => a.data - b.data);
    const lista = [];
    let atual = null;
    ordenada.forEach((x) => {
      if (x.tipo === "falta") {
        if (atual) { atual.fim = x.data; atual.dias++; } else { atual = { inicio: x.data, fim: x.data, dias: 1 }; lista.push(atual); }
      } else {
        atual = null;
      }
    });
    return lista;
  }
  const bradford = (eps) => eps.length ** 2 * eps.reduce((t, e) => t + e.dias, 0);
  const janelaRecente = () => ({ inicio: D.addDias(periodo().fim, -(DIAS_RECENTES - 1)), fim: periodo().fim });
  const faixaBradford = (b) => (b >= FAIXAS_BRADFORD.alto ? "alto" : b >= FAIXAS_BRADFORD.atencao ? "atencao" : "normal");

  // Chance de ver k ou mais faltas em n dias se a pessoa faltasse na taxa p
  // da equipe (cauda da distribuição binomial). Quanto menor, menos provável
  // que o padrão seja acaso.
  function caudaBinomial(k, n, p) {
    if (k <= 0) return 1;
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let termo = Math.pow(1 - p, n); // P(X = 0)
    let acumulado = 0;
    for (let i = 0; i < k; i++) {
      acumulado += termo;
      termo *= ((n - i) / (i + 1)) * (p / (1 - p));
    }
    return Math.max(0, 1 - acumulado);
  }

  // Um padrão só é apontado se for pouco provável que seja acaso. O limite é
  // baixo porque testamos 7 dias e 12 meses por pessoa (muitos testes = mais alarme falso).
  const LIMITE_ACASO = 0.005;
  const MIN_FALTAS_PADRAO = 3;

  // Compara a pessoa com o RESTANTE da equipe (sem ela) no MESMO recorte (dia da
  // semana ou mês). Sem ela, porque as faltas dela inflariam a taxa da equipe e
  // esconderiam o próprio padrão; no mesmo recorte, para a sazonalidade de todos
  // não virar "padrão" de alguém.
  function testarRecorte(daPessoa, daEquipe) {
    const r = resumir(daPessoa);
    const equipe = resumir(daEquipe).taxa;
    if (r.faltas < MIN_FALTAS_PADRAO || !equipe || r.taxa < 2 * equipe) return null;
    const acaso = caudaBinomial(r.faltas, r.previstos, equipe);
    return acaso < LIMITE_ACASO ? { faltas: r.faltas, previstos: r.previstos, taxa: r.taxa, equipe, acaso } : null;
  }

  // Padrões de RECORRÊNCIA da pessoa no histórico inteiro (só dados; o texto é da tela).
  //   { tipo: "dia", dia, ... }  dia da semana bem acima da equipe naquele dia
  //   { tipo: "mes", mes, anos, ... }  mês do ano bem acima da equipe, com faltas em 2 anos ou mais
  function padroes(listaPessoa, listaUnidade) {
    const achados = [];
    if (!listaPessoa.length) return achados;
    const matricula = listaPessoa[0].matricula;
    listaUnidade = listaUnidade.filter((x) => x.matricula !== matricula); // restante da equipe
    [1, 2, 3, 4, 5, 6, 0].forEach((dia) => {
      const t = testarRecorte(listaPessoa.filter((x) => x.dia === dia), listaUnidade.filter((x) => x.dia === dia));
      if (t) achados.push({ tipo: "dia", dia, ...t });
    });
    for (let m = 0; m < 12; m++) {
      const doMes = listaPessoa.filter((x) => x.data.getMonth() === m);
      const anos = new Set(doMes.filter((x) => x.tipo === "falta").map((x) => x.data.getFullYear())).size;
      const t = anos >= 2 && testarRecorte(doMes, listaUnidade.filter((x) => x.data.getMonth() === m));
      if (t) achados.push({ tipo: "mes", mes: m, anos, ...t });
    }
    return achados;
  }

  // Taxa de cada um dos últimos "meses" do histórico (para os mini gráficos).
  function serieMensal(lista, meses = 12) {
    const fimMes = D.inicioDoMes(periodo().fim);
    return Array.from({ length: meses }, (_, i) => {
      const chave = D.chaveMes(D.addMeses(fimMes, i - (meses - 1)));
      return resumir(lista.filter((x) => x.mes === chave)).taxa;
    });
  }

  // Quem continua no CDD (ativo no fim do período) e já estava na operação no início.
  function elegivelNoPeriodo(p, j) {
    return R.ativoEm(p, j.fim) && (!p.admissao || p.admissao <= D.iso(j.inicio));
  }

  // filtro: { dia: 0-6 | null, mes: 0-11 | null } para responder "quem falta às segundas / em novembro".
  function porColaborador(u, j, filtro = {}) {
    const todos = registros(u);
    const recentes = janelaRecente();
    const taxaEquipe90 = resumir(dentro(todos, recentes)).taxa;
    const elegiveis = u.equipe.filter((p) => elegivelNoPeriodo(p, j));
    const pessoas = elegiveis.map((p) => {
      const daPessoa = todos.filter((x) => x.matricula === p.matricula);
      const noPeriodo = dentro(daPessoa, j);
      const r = resumir(noPeriodo);
      const recentesPessoa = dentro(daPessoa, recentes);
      const r90 = resumir(recentesPessoa);
      // Bradford sempre nos últimos 90 dias: as faixas de referência valem para janela curta.
      const b = bradford(episodios(recentesPessoa));
      const filtrados = noPeriodo.filter((x) => (filtro.dia == null || x.dia === filtro.dia) && (filtro.mes == null || x.data.getMonth() === filtro.mes));
      const poucos = r.previstos < MIN_PREVISTOS_PESSOA;
      const pior = [faixaRelativa(r90, taxaEquipe90), faixaBradford(b)].reduce((a, c) => ((ordemNivel[c] ?? 0) > (ordemNivel[a] ?? 0) ? c : a), "normal");
      return {
        pessoa: p, ...r, taxa90: r90.taxa, previstos90: r90.previstos,
        episodios: episodios(noPeriodo).length, bradford: b, filtro: resumir(filtrados), serie: serieMensal(daPessoa),
        padroes: padroes(daPessoa, todos), nivel: poucos ? "poucos-dados" : pior,
      };
    });
    return { pessoas, foraDaAnalise: u.equipe.length - elegiveis.length, taxaEquipe90 };
  }

  // Detalhe de uma pessoa no histórico inteiro.
  function detalheColaborador(u, matricula) {
    const todos = registros(u);
    const daPessoa = todos.filter((x) => x.matricula === matricula);
    const meses = [];
    for (let m = D.inicioDoMes(periodo().inicio); m <= periodo().fim; m = D.addMeses(m, 1)) {
      meses.push({ mes: m, ...resumir(daPessoa.filter((x) => x.mes === D.chaveMes(m))) });
    }
    const eps = episodios(daPessoa);
    return {
      ...resumir(daPessoa),
      meses,
      porDia: [1, 2, 3, 4, 5, 6, 0].map((dia) => ({ dia, ...resumir(daPessoa.filter((x) => x.dia === dia)) })).filter((x) => x.previstos > 0),
      episodios: eps, padroes: padroes(daPessoa, todos),
      bradford90: bradford(episodios(dentro(daPessoa, janelaRecente()))),
      atestados: daPessoa.filter((x) => x.tipo === "atestado").map((x) => x.data),
      inicio: daPessoa.length ? daPessoa.reduce((a, b) => (b.data < a ? b.data : a), daPessoa[0].data) : null,
    };
  }

  function riscoDoMes(u, mesRef) {
    return Array.from({ length: D.diasNoMes(mesRef) }, (_, i) =>
      riscoDoDia(u, new Date(mesRef.getFullYear(), mesRef.getMonth(), i + 1)));
  }

  E.historico = Object.freeze({
    MIN_PREVISTOS, MESES_RECENTES, MESES_BASE, PESOS, LIMITES, FAIXAS, faixa,
    semanaDoMes, periodo, janela, ocorrencias, registros, resumir,
    resumoPeriodo, porDiaSemana, porSemanaDoMes, porMes, riscoDoDia, riscoDoMes,
    MIN_PREVISTOS_PESSOA, DIAS_RECENTES, FAIXAS_BRADFORD, RELATIVO_EQUIPE, MIN_FALTAS_SINAL,
    episodios, bradford, padroes, porColaborador, detalheColaborador, caudaBinomial, LIMITE_ACASO, serieMensal,
  });
})(window.Escala);

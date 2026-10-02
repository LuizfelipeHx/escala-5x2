/* Regras de negócio comuns a todas as unidades. Sem DOM.
   O que muda de um tipo de escala para outro fica em js/core/regras/;
   aqui só perguntamos à regra da unidade e somamos ausências e cobertura. */
(function (E) {
  "use strict";

  const D = E.datas;

  const SITUACOES = Object.freeze({
    trabalho: { rotulo: "Trabalha",   frase: "Você trabalha hoje" },
    folga:    { rotulo: "Folga",      frase: "Hoje é sua folga" },
    ferias:   { rotulo: "Férias",     frase: "Você está de férias" },
    atestado: { rotulo: "Atestado",   frase: "Afastamento por atestado" },
    pendente: { rotulo: "A publicar", frase: "Escala ainda não publicada" },
  });
  const AUSENCIAS = ["ferias", "atestado"];
  const SEMANAS_DOMINGO = 8;

  /* ---------- Unidades e pessoas ---------- */
  const unidades = () => E.dados.unidades;
  const unidade = (id) => unidades().find((u) => u.id === id) || null;

  // Índice matrícula > { pessoa, unidade }, montado na primeira consulta.
  let indice = null;
  function buscar(matricula) {
    if (!indice) {
      indice = new Map();
      unidades().forEach((u) => u.equipe.forEach((p) => indice.set(p.matricula, { p, u })));
    }
    return indice.get(matricula) || null;
  }
  const porMatricula = (m) => buscar(m)?.p || null;
  const unidadeDe = (p) => buscar(p.matricula)?.u || null;

  const regraDe = (u) => E.regras[u.tipoEscala];
  const tipoDe = (u) => ({ id: u.tipoEscala, nome: regraDe(u).nome, resumo: regraDe(u).resumo });
  const funcoes = (u) => Object.keys(u.coberturaMinima);
  const todasFuncoes = () => [...new Set(unidades().flatMap(funcoes))];
  const parceiroDeRota = (p) => unidadeDe(p).equipe.find((x) => x.rota === p.rota && x.matricula !== p.matricula) || null;
  const feriado = (d) => E.dados.feriados.find((f) => f.data === D.iso(d)) || null;

  /* ---------- Situação de uma pessoa num dia ---------- */
  function situacaoNaEscala(p, d) {
    const u = unidadeDe(p);
    return regraDe(u).situacao(p, d, u);
  }

  function ausencia(p, d) {
    const dia = D.iso(d);
    return unidadeDe(p).ausencias.find((a) => a.matricula === p.matricula && a.inicio <= dia && dia <= a.fim) || null;
  }

  // Ausência tem prioridade sobre a escala.
  function situacao(p, d) {
    const a = ausencia(p, d);
    return a ? a.tipo : situacaoNaEscala(p, d);
  }

  const trabalha = (p, d) => situacao(p, d) === "trabalho";

  function proximoDia(p, d, criterio, limite = 90) {
    for (let n = 1; n <= limite; n++) {
      const dia = D.addDias(d, n);
      if (criterio(situacao(p, dia), dia)) return dia;
    }
    return null;
  }
  const proximaFolga = (p, d) => proximoDia(p, d, (s) => s === "folga");
  const proximoRetorno = (p, d) => proximoDia(p, d, (s) => s === "trabalho");
  const proximoDomingoDeFolga = (p, d) => proximoDia(p, d, (s, dia) => s === "folga" && dia.getDay() === 0);

  function resumoMes(p, mesRef) {
    const total = { trabalho: 0, folga: 0, ferias: 0, atestado: 0, pendente: 0, domingos: 0 };
    for (let i = 1; i <= D.diasNoMes(mesRef); i++) {
      const d = new Date(mesRef.getFullYear(), mesRef.getMonth(), i);
      const s = situacao(p, d);
      total[s]++;
      if (s === "folga" && d.getDay() === 0) total.domingos++;
    }
    return total;
  }

  function descreverRegra(p, ref) {
    const u = unidadeDe(p);
    return regraDe(u).descrever(p, u, ref);
  }

  // Só para escalas publicadas por mês; nas outras devolve null.
  function publicacao(u, mesRef) {
    const r = regraDe(u);
    return r.publicacao ? r.publicacao(u, mesRef) : null;
  }

  /* ---------- Visão da unidade ---------- */
  function cobertura(u, d) {
    return funcoes(u).map((funcao) => {
      const situacoes = u.equipe.filter((p) => p.funcao === funcao).map((p) => situacao(p, d));
      const emOperacao = situacoes.filter((s) => s === "trabalho").length;
      const pendente = situacoes.includes("pendente");
      const minimo = u.coberturaMinima[funcao];
      return { funcao, minimo, total: situacoes.length, emOperacao, pendente, ok: pendente || emOperacao >= minimo };
    });
  }

  // "ok", "baixa" (abaixo do mínimo) ou "pendente" (escala a publicar).
  function statusDia(u, d) {
    const c = cobertura(u, d);
    if (c.some((x) => x.pendente)) return "pendente";
    return c.every((x) => x.ok) ? "ok" : "baixa";
  }

  const proximoDomingo = (d) => D.addDias(d, (7 - d.getDay()) % 7);
  const folgamNoDia = (u, d) => u.equipe.filter((p) => situacao(p, d) === "folga");

  // Quem não tem nenhum domingo de folga nas próximas semanas (alerta de CLT).
  // Ignora quem tem domingos ainda a publicar.
  function semDomingoDeFolga(u, d, semanas = SEMANAS_DOMINGO) {
    const domingos = Array.from({ length: semanas }, (_, i) => D.addDias(proximoDomingo(d), i * 7));
    return u.equipe.filter((p) => {
      const s = domingos.map((x) => situacaoNaEscala(p, x));
      return !s.includes("pendente") && !s.includes("folga");
    });
  }

  /* ---------- Validação dos arquivos de dados ---------- */
  function validarDados() {
    const erros = [];
    const vistas = new Set();
    const registrar = (m) => {
      if (vistas.has(m)) erros.push(`Matrícula repetida: ${m}`);
      vistas.add(m);
    };
    E.dados.gestores.forEach((g) => registrar(g.matricula));

    unidades().forEach((u) => {
      const prefixo = (msg) => `${u.nome}: ${msg}`;
      if (!regraDe(u)) { erros.push(prefixo(`tipo de escala "${u.tipoEscala}" não existe.`)); return; }
      if (!u.supervisor) erros.push(prefixo("sem supervisor."));
      else registrar(u.supervisor.matricula);
      u.equipe.forEach((p) => {
        registrar(p.matricula);
        if (!(p.funcao in u.coberturaMinima)) erros.push(prefixo(`${p.nome} com função sem cobertura mínima.`));
      });
      u.ausencias.forEach((a) => {
        if (!u.equipe.some((p) => p.matricula === a.matricula)) erros.push(prefixo(`ausência de matrícula fora da unidade (${a.matricula}).`));
        if (!AUSENCIAS.includes(a.tipo)) erros.push(prefixo(`ausência com tipo inválido (${a.tipo}).`));
        if (a.inicio > a.fim) erros.push(prefixo(`ausência de ${a.matricula} termina antes de começar.`));
      });
      regraDe(u).validar(u).forEach((e) => erros.push(prefixo(e)));
    });
    return erros;
  }

  E.escala = Object.freeze({
    SITUACOES, AUSENCIAS, SEMANAS_DOMINGO,
    unidades, unidade, porMatricula, unidadeDe, tipoDe, funcoes, todasFuncoes, parceiroDeRota, feriado,
    situacaoNaEscala, ausencia, situacao, trabalha,
    proximaFolga, proximoRetorno, proximoDomingoDeFolga, resumoMes, descreverRegra, publicacao,
    cobertura, statusDia, proximoDomingo, folgamNoDia, semDomingoDeFolga,
    validarDados,
  });
})(window.Escala);

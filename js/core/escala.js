/* Regras de negócio da escala 5x2. Sem DOM: só recebe dados e devolve
   respostas. É a parte que pode ser reaproveitada numa versão com servidor. */
(function (E) {
  "use strict";

  const D = E.datas;
  const dados = () => E.dados;
  const cfg = () => E.dados.config;

  const SITUACOES = Object.freeze({
    trabalho: { rotulo: "Trabalha", frase: "Você trabalha hoje" },
    folga:    { rotulo: "Folga",    frase: "Hoje é sua folga" },
    ferias:   { rotulo: "Férias",   frase: "Você está de férias" },
    atestado: { rotulo: "Atestado", frase: "Afastamento por atestado" },
  });
  const AUSENCIAS = ["ferias", "atestado"];

  /* ---------- Rodízio de domingo ---------- */
  function semanaDoRodizio(d) {
    const inicio = D.deIso(cfg().inicioRodizio);
    return Math.floor(D.diasEntre(inicio, D.segundaDaSemana(d)) / 7);
  }

  // Grupo que folga no domingo da semana (segunda a domingo) que contém "d".
  function grupoDeFolgaNoDomingo(d) {
    const grupos = cfg().gruposDomingo;
    const n = semanaDoRodizio(d) % grupos.length;
    return grupos[(n + grupos.length) % grupos.length];
  }

  function folgasDaSemana(p, d) {
    return grupoDeFolgaNoDomingo(d) === p.grupoDomingo
      ? [p.folgaFixa, 0]
      : [p.folgaFixa, p.folgaExtra];
  }

  /* ---------- Situação de uma pessoa num dia ---------- */
  function ausencia(p, d) {
    const dia = D.iso(d);
    return dados().ausencias.find((a) => a.matricula === p.matricula && a.inicio <= dia && dia <= a.fim) || null;
  }

  // Só a escala, ignorando férias e atestados.
  function situacaoNaEscala(p, d) {
    return folgasDaSemana(p, d).includes(d.getDay()) ? "folga" : "trabalho";
  }

  // Situação real: ausência tem prioridade sobre a escala.
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
    const total = { trabalho: 0, folga: 0, ferias: 0, atestado: 0 };
    for (let i = 1; i <= D.diasNoMes(mesRef); i++) {
      total[situacao(p, new Date(mesRef.getFullYear(), mesRef.getMonth(), i))]++;
    }
    return total;
  }

  /* ---------- Equipe ---------- */
  const porId = (id) => dados().equipe.find((p) => p.id === id) || null;
  const porMatricula = (m) => dados().equipe.find((p) => p.matricula === m) || null;
  const parceiroDeRota = (p) => dados().equipe.find((x) => x.rota === p.rota && x.id !== p.id) || null;
  const membrosDoGrupo = (g) => dados().equipe.filter((p) => p.grupoDomingo === g);
  const funcoes = () => Object.keys(cfg().coberturaMinima);
  const feriado = (d) => dados().feriados.find((f) => f.data === D.iso(d)) || null;

  // Cobertura de um dia, por função (sempre a equipe inteira).
  function cobertura(d) {
    return funcoes().map((funcao) => {
      const pessoas = dados().equipe.filter((p) => p.funcao === funcao);
      const emOperacao = pessoas.filter((p) => trabalha(p, d)).length;
      const minimo = cfg().coberturaMinima[funcao];
      return { funcao, minimo, total: pessoas.length, emOperacao, ok: emOperacao >= minimo };
    });
  }

  /* ---------- Validação do arquivo de dados ---------- */
  function validarDados() {
    const { config, equipe, supervisores, ausencias } = dados();
    const erros = [];
    const vistas = new Set();
    [...equipe, ...supervisores].forEach((p) => {
      if (vistas.has(p.matricula)) erros.push(`Matrícula repetida: ${p.matricula}`);
      vistas.add(p.matricula);
    });
    if (D.deIso(config.inicioRodizio).getDay() !== 1) erros.push("inicioRodizio precisa ser uma segunda-feira.");

    const diaValido = (n) => Number.isInteger(n) && n >= 1 && n <= 6;
    equipe.forEach((p) => {
      if (!diaValido(p.folgaFixa) || !diaValido(p.folgaExtra)) erros.push(`${p.nome}: folgas devem ser de 1 (segunda) a 6 (sábado).`);
      if (p.folgaFixa === p.folgaExtra) erros.push(`${p.nome}: folga fixa e folga extra no mesmo dia.`);
      if (!config.gruposDomingo.includes(p.grupoDomingo)) erros.push(`${p.nome}: grupo de domingo "${p.grupoDomingo}" não existe.`);
      if (!(p.funcao in config.coberturaMinima)) erros.push(`${p.nome}: função "${p.funcao}" sem cobertura mínima.`);
    });
    ausencias.forEach((a) => {
      if (!porMatricula(a.matricula)) erros.push(`Ausência para matrícula inexistente: ${a.matricula}.`);
      if (!AUSENCIAS.includes(a.tipo)) erros.push(`Ausência com tipo inválido: ${a.tipo}.`);
      if (a.inicio > a.fim) erros.push(`Ausência de ${a.matricula} termina antes de começar.`);
    });
    return erros;
  }

  E.escala = Object.freeze({
    SITUACOES, AUSENCIAS,
    grupoDeFolgaNoDomingo, folgasDaSemana, situacaoNaEscala, situacao, trabalha, ausencia,
    proximaFolga, proximoRetorno, proximoDomingoDeFolga, resumoMes,
    porId, porMatricula, parceiroDeRota, membrosDoGrupo, funcoes, feriado, cobertura,
    validarDados,
  });
})(window.Escala);

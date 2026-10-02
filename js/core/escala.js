/* Regras de negócio comuns a todas as unidades. Sem DOM.
   O que muda de um tipo de escala para outro fica em js/core/regras/;
   aqui só perguntamos à regra da unidade e somamos ausências e cobertura. */
(function (E) {
  "use strict";

  const D = E.datas;

  const SITUACOES = Object.freeze({
    trabalho:    { rotulo: "Trabalha",       frase: "Você trabalha hoje" },
    folga:       { rotulo: "Folga",          frase: "Hoje é sua folga" },
    ferias:      { rotulo: "Férias",         frase: "Você está de férias" },
    atestado:    { rotulo: "Atestado",       frase: "Afastamento por atestado" },
    afastamento: { rotulo: "Afastamento",    frase: "Você está afastado(a)" },
    falta:       { rotulo: "Falta",          frase: "Falta registrada" },
    pendente:    { rotulo: "A publicar",     frase: "Escala ainda não publicada" },
    inativo:     { rotulo: "Fora do quadro", frase: "Fora do quadro da unidade" },
  });
  // Ausências lançadas no cadastro. Só "falta" é ausência indevida;
  // as demais são justificadas e não contam como absenteísmo.
  const AUSENCIAS = ["ferias", "atestado", "afastamento", "falta"];
  const JUSTIFICADAS = ["ferias", "atestado", "afastamento"];
  const SEMANAS_DOMINGO = 8;

  /* ---------- Unidades e pessoas ---------- */
  const unidades = () => E.dados.unidades;
  const unidade = (id) => unidades().find((u) => u.id === id) || null;

  // Índice matrícula > { pessoa, unidade }. Refeito quando os dados mudam.
  let indice = null;
  function buscar(matricula) {
    if (!indice) {
      indice = new Map();
      unidades().forEach((u) => u.equipe.forEach((p) => indice.set(p.matricula, { p, u })));
    }
    return indice.get(matricula) || null;
  }
  const reindexar = () => { indice = null; };
  const porMatricula = (m) => buscar(m)?.p || null;
  const unidadeDe = (p) => buscar(p.matricula)?.u || null;

  const regraDe = (u) => E.regras[u.tipoEscala];
  const tipoDe = (u) => ({ id: u.tipoEscala, nome: regraDe(u).nome, resumo: regraDe(u).resumo });
  const funcoes = (u) => Object.keys(u.coberturaMinima);
  const todasFuncoes = () => [...new Set(unidades().flatMap(funcoes))];
  const feriado = (d) => E.dados.feriados.find((f) => f.data === D.iso(d)) || null;

  /* ---------- Quadro ativo (admissão e desligamento) ---------- */
  function ativoEm(p, d) {
    const dia = D.iso(d);
    return (!p.admissao || p.admissao <= dia) && (!p.desligamento || dia <= p.desligamento);
  }
  const equipeAtiva = (u, d) => u.equipe.filter((p) => ativoEm(p, d));
  const parceiroDeRota = (p, d = D.hoje()) =>
    unidadeDe(p).equipe.find((x) => x.rota === p.rota && x.matricula !== p.matricula && ativoEm(x, d)) || null;

  /* ---------- Situação de uma pessoa num dia ---------- */
  function situacaoNaEscala(p, d) {
    const u = unidadeDe(p);
    return regraDe(u).situacao(p, d, u);
  }

  function ausencia(p, d) {
    const dia = D.iso(d);
    return unidadeDe(p).ausencias.find((a) => a.matricula === p.matricula && a.inicio <= dia && dia <= a.fim) || null;
  }

  // Ordem: fora do quadro > ausência lançada > escala.
  function situacao(p, d) {
    if (!ativoEm(p, d)) return "inativo";
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
    const total = Object.fromEntries(Object.keys(SITUACOES).map((s) => [s, 0]));
    total.domingos = 0;
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
    const ativos = equipeAtiva(u, d);
    return funcoes(u).map((funcao) => {
      const situacoes = ativos.filter((p) => p.funcao === funcao).map((p) => situacao(p, d));
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
    return equipeAtiva(u, d).filter((p) => {
      const s = domingos.map((x) => situacaoNaEscala(p, x));
      return !s.includes("pendente") && !s.includes("folga");
    });
  }

  /* ---------- Validação dos arquivos de dados ---------- */
  function validarDados() {
    const erros = [];
    const vistas = new Set();
    const pisVistos = new Set();
    const registrar = (m) => {
      if (vistas.has(m)) erros.push(`Matrícula repetida: ${m}`);
      vistas.add(m);
    };
    const DATA = /^\d{4}-\d{2}-\d{2}$/;

    E.dados.liderancas.forEach((l) => {
      registrar(l.matricula);
      if (!["coordenador", "gerente"].includes(l.perfil)) erros.push(`${l.nome}: perfil "${l.perfil}" inválido.`);
      (l.unidades || []).forEach((id) => { if (!unidade(id)) erros.push(`${l.nome}: unidade "${id}" não existe.`); });
    });

    unidades().forEach((u) => {
      const prefixo = (msg) => `${u.nome}: ${msg}`;
      if (!regraDe(u)) { erros.push(prefixo(`tipo de escala "${u.tipoEscala}" não existe.`)); return; }
      if (!u.supervisor) erros.push(prefixo("sem supervisor."));
      else registrar(u.supervisor.matricula);
      Object.entries(u.coberturaMinima).forEach(([f, n]) => {
        if (!Number.isInteger(n) || n < 0) erros.push(prefixo(`cobertura mínima de ${f} inválida.`));
      });

      u.equipe.forEach((p) => {
        registrar(p.matricula);
        if (!(p.funcao in u.coberturaMinima)) erros.push(prefixo(`${p.nome} com função sem cobertura mínima.`));
        if (p.pis !== undefined) {
          if (!E.documentos.pisOuCpfValido(p.pis)) erros.push(prefixo(`${p.nome}: PIS/CPF inválido.`));
          else if (pisVistos.has(p.pis)) erros.push(prefixo(`${p.nome}: PIS/CPF repetido.`));
          pisVistos.add(p.pis);
        }
        ["admissao", "desligamento"].forEach((k) => {
          if (p[k] !== undefined && !DATA.test(p[k])) erros.push(prefixo(`${p.nome}: data de ${k} inválida.`));
        });
        if (p.admissao && p.desligamento && p.desligamento < p.admissao) erros.push(prefixo(`${p.nome}: desligamento antes da admissão.`));
      });

      u.ausencias.forEach((a) => {
        const p = u.equipe.find((x) => x.matricula === a.matricula);
        if (!p) { erros.push(prefixo(`ausência de matrícula fora da unidade (${a.matricula}).`)); return; }
        if (!AUSENCIAS.includes(a.tipo)) erros.push(prefixo(`ausência com tipo inválido (${a.tipo}).`));
        if (!DATA.test(a.inicio) || !DATA.test(a.fim)) { erros.push(prefixo(`ausência de ${p.nome} com data inválida.`)); return; }
        if (a.inicio > a.fim) erros.push(prefixo(`ausência de ${p.nome} termina antes de começar.`));
        if (a.tipo === "falta") {
          for (let d = D.deIso(a.inicio); D.iso(d) <= a.fim; d = D.addDias(d, 1)) {
            if (situacaoNaEscala(p, d) !== "trabalho") { erros.push(prefixo(`falta de ${p.nome} em ${D.curto(d)}, que não é dia de trabalho na escala.`)); break; }
          }
        }
      });
      regraDe(u).validar(u).forEach((e) => erros.push(prefixo(e)));
    });
    return erros;
  }

  E.escala = Object.freeze({
    SITUACOES, AUSENCIAS, JUSTIFICADAS, SEMANAS_DOMINGO,
    unidades, unidade, porMatricula, unidadeDe, reindexar, tipoDe, funcoes, todasFuncoes, parceiroDeRota, feriado,
    ativoEm, equipeAtiva,
    situacaoNaEscala, ausencia, situacao, trabalha,
    proximaFolga, proximoRetorno, proximoDomingoDeFolga, resumoMes, descreverRegra, publicacao,
    cobertura, statusDia, proximoDomingo, folgamNoDia, semDomingoDeFolga,
    validarDados,
  });
})(window.Escala);

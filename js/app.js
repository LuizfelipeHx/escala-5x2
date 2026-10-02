/* Ponto de entrada: guarda o estado da tela, decide o que desenhar
   e trata os cliques. Não contém regra de negócio nem HTML de tela. */
(function (E) {
  "use strict";

  const D = E.datas;
  const R = E.escala;
  const $ = (s) => document.querySelector(s);

  const ABAS_SUPERVISAO = [
    { id: "hoje", rotulo: "Hoje", tela: "hoje", filtros: true },
    { id: "semana", rotulo: "Semana", tela: "semana", filtros: true },
    { id: "cobertura", rotulo: "Cobertura", tela: "cobertura" },
    { id: "individual", rotulo: "Escala individual", tela: "individual" },
  ];
  const ABAS = {
    colaborador: [{ id: "minha", rotulo: "Minha escala", tela: "colaborador" }],
    supervisor: ABAS_SUPERVISAO,
    gestor: [{ id: "geral", rotulo: "Visão geral", tela: "geral", semFaixa: true }, ...ABAS_SUPERVISAO],
  };

  const estado = {
    usuario: null,
    aba: null,
    unidadeId: null,
    pessoaMatricula: null,
    data: D.hoje(),
    mes: D.inicioDoMes(D.hoje()),
    inicioCobertura: D.hoje(),
    busca: "",
    funcao: "",
  };

  const errosDados = R.validarDados();
  if (errosDados.length) console.warn("Problemas nos arquivos de dados:", errosDados);

  const abas = () => ABAS[estado.usuario.perfil];
  const abaAtual = () => abas().find((a) => a.id === estado.aba) || abas()[0];

  function selecionarUnidade(id) {
    Object.assign(estado, { unidadeId: id, pessoaMatricula: R.unidade(id).equipe[0].matricula, busca: "", funcao: "" });
    const busca = $("#f-busca"), funcao = $("#f-funcao");
    if (busca) busca.value = "";
    if (funcao) funcao.value = "";
  }

  /* ---------- Desenho ---------- */
  function montar() {
    estado.usuario = E.sessao.atual();
    if (!estado.usuario) {
      $("#app").innerHTML = E.telas.login.render();
      return;
    }
    Object.assign(estado, { aba: abas()[0].id, data: D.hoje(), mes: D.inicioDoMes(D.hoje()), inicioCobertura: D.hoje() });
    $("#app").innerHTML = E.ui.layout(estado.usuario, abas(), errosDados);
    selecionarUnidade(estado.usuario.unidadeId || R.unidades()[0].id);
    atualizar();
  }

  function atualizar() {
    const aba = abaAtual();
    document.querySelectorAll(".aba").forEach((b) => b.classList.toggle("ativa", b.dataset.aba === aba.id));
    $("#filtros").classList.toggle("oculto", !aba.filtros);
    $("#faixa-unidade").innerHTML = aba.semFaixa ? "" : E.ui.faixaUnidade(R.unidade(estado.unidadeId), estado.usuario.perfil === "gestor");
    $("#conteudo").innerHTML = E.telas[aba.tela].render(estado);
  }

  function entrar(matricula, senha) {
    const r = E.sessao.entrar(matricula, senha);
    if (r.erro) {
      const campo = $("#login-erro");
      if (campo) campo.textContent = r.erro;
      return;
    }
    montar();
  }

  /* ---------- Ações dos botões (data-acao) ---------- */
  const PASSO_COBERTURA = E.telas.cobertura.DIAS_ANALISADOS;
  const ACOES = {
    "dia-ant":  () => { estado.data = D.addDias(estado.data, -1); },
    "dia-prox": () => { estado.data = D.addDias(estado.data, 1); },
    "sem-ant":  () => { estado.data = D.addDias(estado.data, -7); },
    "sem-prox": () => { estado.data = D.addDias(estado.data, 7); },
    "cob-ant":  () => { estado.inicioCobertura = D.addDias(estado.inicioCobertura, -PASSO_COBERTURA); },
    "cob-prox": () => { estado.inicioCobertura = D.addDias(estado.inicioCobertura, PASSO_COBERTURA); },
    "ir-hoje":  () => { estado.data = D.hoje(); estado.inicioCobertura = D.hoje(); },
    "mes-ant":  () => { estado.mes = D.addMeses(estado.mes, -1); },
    "mes-prox": () => { estado.mes = D.addMeses(estado.mes, 1); },
    "mes-hoje": () => { estado.mes = D.inicioDoMes(D.hoje()); },
    "abrir-unidade": (el) => { selecionarUnidade(el.dataset.unidade); estado.aba = "hoje"; },
  };

  const podeVerEquipe = () => ["supervisor", "gestor"].includes(estado.usuario?.perfil);

  function abrirPessoa(matricula) {
    Object.assign(estado, { pessoaMatricula: matricula, mes: D.inicioDoMes(estado.data), aba: "individual" });
    atualizar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("click", (e) => {
    const alvo = e.target;
    const acao = alvo.closest("[data-acao]");

    if (acao?.dataset.acao === "demo") return entrar(acao.dataset.matricula, E.dados.senhaDemo);
    if (acao?.dataset.acao === "sair") { E.sessao.sair(); return montar(); }

    const aba = alvo.closest(".aba");
    if (aba) { estado.aba = aba.dataset.aba; return atualizar(); }

    const pessoa = alvo.closest("[data-id]");
    if (pessoa && podeVerEquipe()) return abrirPessoa(pessoa.dataset.id);

    const fn = acao && ACOES[acao.dataset.acao];
    if (fn) {
      fn(acao);
      atualizar();
      if (acao.dataset.acao === "abrir-unidade") window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  document.addEventListener("submit", (e) => {
    if (e.target.id !== "form-login") return;
    e.preventDefault();
    const f = e.target.elements;
    entrar(f.matricula.value, f.senha.value);
  });

  document.addEventListener("change", (e) => {
    const { id, value } = e.target;
    if (id === "data-sel" && value) estado.data = D.deIso(value);
    else if (id === "pessoa-sel") estado.pessoaMatricula = value;
    else if (id === "unidade-sel") selecionarUnidade(value);
    else if (id === "f-funcao") estado.funcao = value;
    else return;
    atualizar();
  });

  document.addEventListener("input", (e) => {
    if (e.target.id !== "f-busca") return;
    estado.busca = e.target.value;
    atualizar();
  });

  montar();
})(window.Escala);

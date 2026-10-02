/* Ponto de entrada: guarda o estado da tela, decide o que desenhar
   e trata os cliques. Não contém regra de negócio nem HTML de tela. */
(function (E) {
  "use strict";

  const D = E.datas;
  const R = E.escala;
  const $ = (s) => document.querySelector(s);

  E.repositorio.carregar();

  // Menu da liderança, em grupos. "visao" escolhe a visão dentro da tela de
  // absenteísmo; "multi" só aparece para quem acompanha mais de um CDD;
  // "geral" é a tela sem CDD específico.
  const MENU = [
    { grupo: "Operação", itens: [
      { id: "hoje", rotulo: "Hoje", icone: "hoje", tela: "hoje", filtros: true },
      { id: "semana", rotulo: "Semana", icone: "semana", tela: "semana", filtros: true },
      { id: "cobertura", rotulo: "Cobertura", icone: "cobertura", tela: "cobertura" },
      { id: "individual", rotulo: "Escala individual", icone: "individual", tela: "individual" },
    ] },
    { grupo: "Absenteísmo", itens: [
      { id: "abs-historico", rotulo: "Histórico", icone: "historico", tela: "absenteismo", visao: "historico" },
      { id: "abs-risco", rotulo: "Risco do mês", icone: "risco", tela: "absenteismo", visao: "risco" },
      { id: "abs-pessoas", rotulo: "Por colaborador", icone: "pessoas", tela: "absenteismo", visao: "colaboradores" },
    ] },
    { grupo: "Gestão", itens: [
      { id: "geral", rotulo: "Visão geral", icone: "geral", tela: "geral", multi: true, geral: true },
      { id: "cadastro", rotulo: "Cadastro", icone: "cadastro", tela: "cadastro" },
    ] },
  ];
  // Atalhos da barra inferior no celular (o resto fica na gaveta "Mais").
  const ATALHOS_CELULAR = [{ id: "hoje" }, { id: "semana" }, { id: "abs-historico", rotulo: "Absenteísmo" }];
  const TELA_COLABORADOR = { id: "minha", rotulo: "Minha escala", tela: "colaborador" };

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
    // Absenteísmo: visão, período, mês/dia do calendário de risco e,
    // na visão por colaborador, filtros (dia da semana, mês) e pessoa aberta.
    abs: { visao: "historico", meses: 6, mesRisco: D.addMeses(D.hoje(), 1), diaRisco: null, dia: null, mes: null, pessoa: null },
  };

  // Menu de quem está logado (null para colaborador, que tem uma tela só).
  function menu() {
    if (!E.sessao.ehLideranca(estado.usuario)) return null;
    const multi = estado.usuario.unidadeIds.length > 1;
    return MENU.map((g) => ({ ...g, itens: g.itens.filter((i) => !i.multi || multi) })).filter((g) => g.itens.length);
  }
  const itens = () => (menu() || [{ grupo: "", itens: [TELA_COLABORADOR] }]).flatMap((g) => g.itens.map((i) => ({ ...i, grupo: g.grupo })));
  const abaAtual = () => itens().find((a) => a.id === estado.aba) || itens()[0];
  const abaInicial = () => (itens().some((i) => i.id === "geral") ? "geral" : itens()[0].id);
  const unidadeAtual = () => R.unidade(estado.unidadeId);
  const atalhos = () => ATALHOS_CELULAR
    .map((a) => { const item = itens().find((i) => i.id === a.id); return item && { ...item, ...a }; })
    .filter(Boolean);

  function selecionarUnidade(id) {
    const u = R.unidade(id);
    Object.assign(estado, { unidadeId: id, pessoaMatricula: u.equipe[0]?.matricula || null, busca: "", funcao: "" });
    estado.abs.diaRisco = null;
    estado.abs.pessoa = null;
    const busca = $("#f-busca"), funcao = $("#f-funcao");
    if (busca) busca.value = "";
    if (funcao) funcao.value = "";
  }

  /* ---------- Desenho ---------- */
  function montar() {
    fecharDialogo();
    estado.usuario = E.sessao.atual();
    if (!estado.usuario) {
      $("#app").innerHTML = E.telas.login.render();
      return;
    }
    Object.assign(estado, { aba: abaInicial(), data: D.hoje(), mes: D.inicioDoMes(D.hoje()), inicioCobertura: D.hoje() });
    $("#app").innerHTML = E.ui.layout(estado.usuario, menu(), atalhos(), R.validarDados());
    selecionarUnidade(estado.usuario.unidadeIds[0]);
    ultimaTela = null;
    atualizar();
  }

  let ultimaTela = null;
  function atualizar() {
    const aba = abaAtual();
    if (aba.visao) estado.abs.visao = aba.visao;
    document.querySelectorAll("[data-aba]").forEach((b) => b.classList.toggle("ativo", b.dataset.aba === aba.id));
    document.querySelectorAll(".barra-item[data-grupo]").forEach((b) => {
      if (b.dataset.grupo === "Absenteísmo") b.classList.toggle("ativo", aba.grupo === "Absenteísmo");
    });
    $("#filtros")?.classList.toggle("oculto", !aba.filtros);
    if ($("#lateral-cdd")) $("#lateral-cdd").innerHTML = E.ui.blocoCdd(unidadeAtual(), estado.usuario.unidadeIds);
    if ($("#cabecalho-pagina")) {
      $("#cabecalho-pagina").innerHTML = E.ui.cabecalhoPagina({
        grupo: aba.grupo, titulo: aba.rotulo, u: aba.geral ? null : unidadeAtual(), ficticio: aba.grupo === "Absenteísmo",
      });
    }
    // Animação de entrada só quando a tela muda (não a cada filtro).
    const trocou = ultimaTela !== aba.id;
    ultimaTela = aba.id;
    $("#conteudo").innerHTML = `<div class="tela${trocou ? " entrando" : ""}">${E.telas[aba.tela].render(estado)}</div>`;
  }

  function abrirMenu(abrir) {
    document.body.classList.toggle("menu-aberto", abrir);
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

  /* ---------- Janela de formulário (<dialog>) ---------- */
  function abrirDialogo(html) {
    const d = $("#dialogo");
    d.innerHTML = html;
    d.showModal();
    d.querySelector("input, select")?.focus();
  }
  function fecharDialogo() {
    const d = $("#dialogo");
    if (d?.open) d.close();
  }

  function mostrarErros(alvo, erros) {
    if (alvo) alvo.innerHTML = erros.map((e) => `<span>${E.ui.esc(e)}</span>`).join("");
    else window.alert(erros.join("\n"));
  }

  // Depois de gravar: se deu certo, fecha o formulário e redesenha.
  // Se a alteração afetou o próprio usuário logado, remonta tudo.
  function concluir(resultado, alvoErros = null) {
    if (resultado.erros) return mostrarErros(alvoErros, resultado.erros);
    fecharDialogo();
    const antes = estado.usuario;
    if (!E.sessao.atual() || !R.unidade(estado.unidadeId)) return montar();
    estado.usuario = E.sessao.atual();
    if (antes.perfil !== estado.usuario.perfil || antes.unidadeIds.join() !== estado.usuario.unidadeIds.join()) return montar();
    if (!R.unidade(estado.unidadeId).equipe.some((p) => p.matricula === estado.pessoaMatricula)) {
      estado.pessoaMatricula = R.unidade(estado.unidadeId).equipe[0]?.matricula || null;
    }
    atualizar();
  }

  function baixar(nome, texto) {
    const url = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: nome });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* ---------- Ações dos botões (data-acao) ---------- */
  const PASSO_COBERTURA = E.telas.cobertura.DIAS_ANALISADOS;
  const C = E.telas.cadastro;
  const Repo = E.repositorio;
  const nomeDe = (m) => R.porMatricula(m)?.nome || m;

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
    "abrir-unidade": (el) => { selecionarUnidade(el.dataset.unidade); estado.aba = "hoje"; window.scrollTo({ top: 0, behavior: "smooth" }); },

    // Menu no celular (gaveta)
    "abrir-menu":  () => { abrirMenu(true); return false; },
    "fechar-menu": () => { abrirMenu(false); return false; },

    // Absenteísmo
    "risco-ant":  () => { estado.abs.mesRisco = D.addMeses(estado.abs.mesRisco, -1); estado.abs.diaRisco = null; },
    "risco-prox": () => { estado.abs.mesRisco = D.addMeses(estado.abs.mesRisco, 1); estado.abs.diaRisco = null; },
    "risco-hoje": () => { estado.abs.mesRisco = D.addMeses(D.hoje(), 1); estado.abs.diaRisco = null; },
    "risco-dia":  (el) => { estado.abs.diaRisco = el.dataset.dia; },
    "abs-pessoa": (el) => {
      estado.abs.pessoa = el.dataset.matricula;
      atualizar();
      document.querySelector("#detalhe-pessoa")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return false;
    },

    // Cadastro: estas ações cuidam do próprio redesenho.
    "nova-pessoa":     () => { abrirDialogo(C.formPessoa(unidadeAtual(), null)); return false; },
    "editar-pessoa":   (el) => { abrirDialogo(C.formPessoa(unidadeAtual(), R.porMatricula(el.dataset.alvo))); return false; },
    "nova-ocorrencia": () => { abrirDialogo(C.formOcorrencia(unidadeAtual())); return false; },
    "fechar-dialogo":  () => { fecharDialogo(); return false; },
    "desligar-pessoa": (el) => {
      if (window.confirm(`Registrar o desligamento de ${nomeDe(el.dataset.alvo)} com data de hoje?\nO histórico de faltas continua guardado.`)) {
        concluir(Repo.desligarPessoa(el.dataset.alvo, D.iso(D.hoje())));
      }
      return false;
    },
    "excluir-pessoa": (el) => {
      if (window.confirm(`Excluir o cadastro de ${nomeDe(el.dataset.alvo)}?\nIsso apaga também o histórico. Use só para cadastro feito por engano.`)) {
        concluir(Repo.excluirPessoa(el.dataset.alvo), $("#dialogo .form-erros"));
      }
      return false;
    },
    "excluir-ocorrencia": (el) => {
      if (window.confirm("Excluir esta ocorrência?")) concluir(Repo.excluirOcorrencia(estado.unidadeId, Number(el.dataset.indice)));
      return false;
    },
    "exportar": () => { baixar(`escala5x2-dados-${D.iso(D.hoje())}.json`, Repo.exportar()); return false; },
    "restaurar": () => {
      if (window.confirm("Apagar as alterações deste navegador e voltar aos dados de exemplo?")) concluir(Repo.restaurarExemplo());
      return false;
    },
  };

  const podeVerEquipe = () => E.sessao.ehLideranca(estado.usuario);

  function abrirPessoa(matricula) {
    Object.assign(estado, { pessoaMatricula: matricula, mes: D.inicioDoMes(estado.data), aba: "individual" });
    atualizar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", (e) => {
    const alvo = e.target;
    const acao = alvo.closest("[data-acao]");

    if (acao?.dataset.acao === "sair") { abrirMenu(false); E.sessao.sair(); return montar(); }
    if (acao?.dataset.acao === "ver-senha") return E.telas.login.alternarSenha(acao);

    const aba = alvo.closest("[data-aba]");
    if (aba) {
      estado.aba = aba.dataset.aba;
      abrirMenu(false);
      atualizar();
      window.scrollTo({ top: 0 });
      return;
    }

    const pessoa = alvo.closest("[data-id]");
    if (pessoa && podeVerEquipe()) return abrirPessoa(pessoa.dataset.id);

    const fn = acao && ACOES[acao.dataset.acao];
    if (fn && fn(acao) !== false) atualizar();
  });

  document.addEventListener("submit", (e) => {
    const form = e.target;
    const erros = form.querySelector(".form-erros");
    const u = form.dataset.unidade && R.unidade(form.dataset.unidade);
    e.preventDefault();

    if (form.id === "form-login") return entrar(form.elements.matricula.value, form.elements.senha.value);
    if (form.id === "form-pessoa") return concluir(Repo.salvarPessoa(u.id, C.lerPessoa(form, u), form.dataset.original), erros);
    if (form.id === "form-ocorrencia") return concluir(Repo.salvarOcorrencia(u.id, C.lerOcorrencia(form)), erros);
    if (form.id === "form-unidade") return concluir(Repo.salvarUnidade(u.id, C.lerUnidade(form, u)), erros);
  });

  document.addEventListener("change", (e) => {
    const el = e.target;

    // Seletor de dias: no máximo 2 marcados.
    const grupo = el.closest(".dias[data-max]");
    if (grupo && el.checked && grupo.querySelectorAll("input:checked").length > Number(grupo.dataset.max)) {
      el.checked = false;
      return;
    }

    if (el.id === "arquivo-importar" && el.files[0]) {
      el.files[0].text().then((texto) => concluir(Repo.importar(texto)));
      return;
    }

    const { id, value } = el;
    if (id === "data-sel" && value) estado.data = D.deIso(value);
    else if (id === "pessoa-sel") estado.pessoaMatricula = value;
    else if (id === "unidade-sel") selecionarUnidade(value);
    else if (id === "f-funcao") estado.funcao = value;
    else if (id === "abs-periodo") estado.abs.meses = Number(value);
    else if (id === "abs-dia") estado.abs.dia = value === "" ? null : Number(value);
    else if (id === "abs-mes") estado.abs.mes = value === "" ? null : Number(value);
    else return;
    atualizar();
  });

  // Teclado: Esc fecha o menu do celular; Enter ou espaço numa linha clicável
  // (que não é botão) age como clique.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-aberto")) return abrirMenu(false);
    const alvo = e.target.closest("tr[data-acao]");
    if (!alvo || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    alvo.click();
  });

  document.addEventListener("input", (e) => {
    if (e.target.id !== "f-busca") return;
    estado.busca = e.target.value;
    atualizar();
  });

  montar();
})(window.Escala);

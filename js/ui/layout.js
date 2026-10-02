/* Moldura da área logada. É montada uma vez por login; depois só o
   cabeçalho da página, o bloco do CDD e o #conteudo são redesenhados.

   Liderança: menu lateral agrupado (computador) e barra inferior com
   gaveta (celular). Colaborador: só o topo, porque tem uma tela só. */
(function (E) {
  "use strict";

  const U = () => E.ui;

  const avisos = (errosDados) => {
    const avisoCarga = E.repositorio.avisoCarga();
    return `${errosDados.length ? `<div class="aviso aviso-erro"><b>Revise os arquivos da pasta dados/</b>${errosDados.map((e) => `<span>${U().esc(e)}</span>`).join("")}</div>` : ""}
      ${avisoCarga ? `<div class="aviso aviso-atencao"><b>Dados de exemplo restaurados</b><span>${U().esc(avisoCarga)}</span></div>` : ""}`;
  };

  const rodape = '<p class="rodape">Protótipo acadêmico (MBL) com dados fictícios. Escala 5x2: 5 dias de trabalho e 2 de folga por semana.</p>';

  function cartaoUsuario(usuario) {
    const R = E.escala;
    const onde = usuario.unidadeIds.length > 1 ? `${usuario.unidadeIds.length} CDDs` : R.unidade(usuario.unidadeIds[0]).nome;
    return `<div class="usuario">
      ${U().avatar(usuario.nome)}
      <div class="usuario-info"><b>${U().esc(usuario.nome)}</b><small>${U().esc(usuario.funcao)} · ${U().esc(onde)}</small></div>
      <button class="btn-sair" data-acao="sair" aria-label="Sair" title="Sair">${U().icone("sair", 18)}</button>
    </div>`;
  }

  /* ---------- Colaborador ---------- */
  function layoutColaborador(usuario, errosDados) {
    return `<header class="topo">
        <div class="topo-in">
          <div class="marca"><h1>Consulta de Escala</h1><p>Equipe de Entrega <span class="selo">Protótipo</span></p></div>
          ${cartaoUsuario(usuario)}
        </div>
      </header>
      <main class="principal-simples">
        ${avisos(errosDados)}
        <section id="conteudo"></section>
        ${rodape}
      </main>`;
  }

  /* ---------- Liderança ---------- */
  function menuLateral(menu) {
    return menu.map((g) => `<p class="menu-grupo">${U().esc(g.grupo)}</p>
      ${g.itens.map((i) => `<button class="menu-item" data-aba="${i.id}">${U().icone(i.icone)}<span>${U().esc(i.rotulo)}</span></button>`).join("")}`).join("");
  }

  // Atalhos da barra inferior no celular (o resto fica na gaveta "Mais").
  function barraInferior(atalhos) {
    return `<nav class="barra-inferior" aria-label="Atalhos">
      ${atalhos.map((a) => `<button class="barra-item" data-aba="${a.id}" data-grupo="${U().esc(a.grupo)}">${U().icone(a.icone, 22)}<span>${U().esc(a.rotulo)}</span></button>`).join("")}
      <button class="barra-item" data-acao="abrir-menu" aria-label="Abrir menu">${U().icone("mais", 22)}<span>Mais</span></button>
    </nav>`;
  }

  function layoutLideranca(usuario, menu, atalhos, errosDados) {
    return `<div class="app">
      <aside class="lateral" id="lateral" aria-label="Menu principal">
        <div class="lateral-topo">
          <div class="marca"><h1>Consulta de Escala</h1><p>Equipe de Entrega <span class="selo">Protótipo</span></p></div>
          <button class="fechar-menu" data-acao="fechar-menu" aria-label="Fechar menu">${U().icone("fechar")}</button>
        </div>
        <div class="lateral-cdd" id="lateral-cdd"></div>
        <nav class="menu">${menuLateral(menu)}</nav>
        <div class="lateral-usuario">${cartaoUsuario(usuario)}</div>
      </aside>
      <div class="veu" data-acao="fechar-menu"></div>
      <div class="principal">
        <header class="topo-movel">
          <div class="marca"><h1>Consulta de Escala</h1></div>
          ${U().avatar(usuario.nome)}
        </header>
        <main>
          ${avisos(errosDados)}
          <div id="cabecalho-pagina"></div>
          <div class="filtros oculto" id="filtros">
            <input id="f-busca" type="search" placeholder="Buscar por nome, rota ou matrícula..." autocomplete="off">
            <select id="f-funcao" aria-label="Função">
              <option value="">Todas as funções</option>
              ${E.escala.todasFuncoes().map((f) => `<option>${U().esc(f)}</option>`).join("")}
            </select>
          </div>
          <section id="conteudo"></section>
          ${rodape}
        </main>
      </div>
      ${barraInferior(atalhos)}
    </div>`;
  }

  // Bloco do CDD no menu: seletor (vários CDDs) ou nome fixo (um CDD).
  E.ui.blocoCdd = function (u, visiveis) {
    const R = E.escala;
    if (visiveis.length > 1) {
      return `<label class="rotulo-cdd" for="unidade-sel">Unidade</label>
        <select id="unidade-sel">${R.unidades().filter((x) => visiveis.includes(x.id)).map((x) =>
          `<option value="${x.id}"${x.id === u.id ? " selected" : ""}>${U().esc(x.nome)} (${U().esc(x.uf)})</option>`).join("")}</select>`;
    }
    return `<span class="rotulo-cdd">Unidade</span><b class="nome-cdd">${U().esc(u.nome)} <small>${U().esc(u.uf)}</small></b>`;
  };

  // Cabeçalho padrão de toda página: grupo, título e o contexto do CDD.
  E.ui.cabecalhoPagina = function ({ grupo, titulo, u, ficticio }) {
    return `<div class="cabecalho-pagina">
      <div><small class="sobretitulo">${U().esc(grupo)}</small><h2>${U().esc(titulo)}</h2></div>
      <div class="cabecalho-contexto">
        ${u ? `<span class="contexto-cdd">${U().esc(u.nome)}</span>${U().chipTipo(u)}` : ""}
        ${ficticio ? '<span class="chip-ficticio" title="Histórico gerado para demonstração">Histórico fictício</span>' : ""}
      </div>
    </div>`;
  };

  E.ui.layout = function (usuario, menu, atalhos, errosDados) {
    return menu ? layoutLideranca(usuario, menu, atalhos, errosDados) : layoutColaborador(usuario, errosDados);
  };
})(window.Escala);

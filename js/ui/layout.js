/* Moldura da área logada: cabeçalho, abas, filtros e rodapé.
   É montada uma vez por login; só o #conteudo é redesenhado depois. */
(function (E) {
  "use strict";

  E.ui.layout = function (usuario, abas, errosDados) {
    const U = E.ui;
    const cfg = E.dados.config;
    const perfil = usuario.perfil === "supervisor"
      ? `${U.esc(usuario.funcao)} · Visão da equipe`
      : `${U.esc(usuario.funcao)} · ${U.esc(usuario.rota)}`;

    return `
    <header class="topo">
      <div class="topo-in">
        <div class="marca">
          <div class="logo">5x2</div>
          <div>
            <h1>Consulta de Escala</h1>
            <p>${U.esc(cfg.equipe)} · ${U.esc(cfg.unidade)} <span class="selo">Protótipo</span></p>
          </div>
        </div>
        <div class="usuario">
          ${U.avatar(usuario.nome)}
          <div class="usuario-info"><b>${U.esc(usuario.nome)}</b><small>${perfil}</small></div>
          <button class="btn-sair" data-acao="sair">Sair</button>
        </div>
      </div>
    </header>
    <main>
      ${errosDados.length ? `<div class="aviso aviso-erro"><b>Revise o arquivo dados/equipe.js</b>${errosDados.map((e) => `<span>${U.esc(e)}</span>`).join("")}</div>` : ""}
      ${abas.length > 1 ? `<nav class="abas" aria-label="Visões">${abas.map((a) => `<button class="aba" data-aba="${a.id}">${a.rotulo}</button>`).join("")}</nav>` : ""}
      <div class="filtros oculto" id="filtros">
        <input id="f-busca" type="search" placeholder="Buscar por nome, rota ou matrícula..." autocomplete="off">
        <select id="f-funcao" aria-label="Função">
          <option value="">Todas as funções</option>
          ${E.escala.funcoes().map((f) => `<option>${U.esc(f)}</option>`).join("")}
        </select>
      </div>
      <section id="conteudo"></section>
      <p class="rodape">Protótipo acadêmico (MBL) com dados fictícios. Escala 5x2: 5 dias de trabalho e 2 de folga por semana, com rodízio de domingo.</p>
    </main>`;
  };
})(window.Escala);

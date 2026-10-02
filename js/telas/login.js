/* Tela de login (simulado). */
(function (E) {
  "use strict";

  E.telas = E.telas || {};

  E.telas.login = {
    render() {
      const U = E.ui;
      const cfg = E.dados.config;
      const equipe = E.dados.equipe;
      const demos = [
        equipe.find((p) => p.funcao === "Motorista"),
        equipe.find((p) => p.funcao === "Ajudante"),
        E.dados.supervisores[0],
      ].filter(Boolean);

      return `<div class="login-pagina">
        <div class="login-card">
          <div class="login-marca">
            <div class="logo">5x2</div>
            <div><h1>Consulta de Escala</h1><p>${U.esc(cfg.equipe)} · ${U.esc(cfg.unidade)}</p></div>
          </div>

          <form id="form-login" autocomplete="off" novalidate>
            <label>Matrícula<input name="matricula" inputmode="numeric" placeholder="Ex.: 10001" required></label>
            <label>Senha<input name="senha" type="password" placeholder="Sua senha" required></label>
            <p class="login-erro" id="login-erro" role="alert"></p>
            <button class="btn btn-primario btn-largo" type="submit">Entrar</button>
          </form>

          <div class="demo">
            <p>Acessos de demonstração <span>(senha ${U.esc(E.dados.senhaDemo)})</span></p>
            ${demos.map((u) => `<button class="demo-item" data-acao="demo" data-matricula="${U.esc(u.matricula)}">
                ${U.avatar(u.nome)}
                <span><b>${U.esc(u.nome)}</b><small>${U.esc(u.funcao)} · matrícula ${U.esc(u.matricula)}</small></span>
                <span class="demo-seta">›</span>
              </button>`).join("")}
          </div>

          <p class="login-nota">Login simulado para apresentação, com dados fictícios. Na versão final, o acesso será validado por um servidor.</p>
        </div>
      </div>`;
    },
  };
})(window.Escala);

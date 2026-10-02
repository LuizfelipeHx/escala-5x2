/* Tela de login (simulado). Os acessos de demonstração ficam no README,
   não na tela, para o login ter a aparência da versão final. */
(function (E) {
  "use strict";

  E.telas = E.telas || {};

  E.telas.login = {
    render() {
      return `<div class="login-pagina">
        <div class="login-foto" aria-hidden="true"></div>
        <div class="login-card">
          <div class="login-marca">
            <h1>Consulta de Escala</h1>
            <p>Equipe de Entrega · ${E.escala.unidades().length} CDDs</p>
          </div>

          <form id="form-login" autocomplete="off" novalidate>
            <label>Matrícula<input name="matricula" inputmode="numeric" placeholder="Sua matrícula" required></label>
            <label>Senha<input name="senha" type="password" placeholder="Sua senha" required></label>
            <p class="login-erro" id="login-erro" role="alert"></p>
            <button class="btn btn-primario btn-largo" type="submit">Entrar</button>
          </form>

          <p class="login-nota">Protótipo com dados fictícios.</p>
        </div>
      </div>`;
    },
  };
})(window.Escala);

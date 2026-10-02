/* Tela de login (simulado). Os acessos de demonstração ficam no README,
   não na tela, para o login ter a aparência da versão final. */
(function (E) {
  "use strict";

  E.telas = E.telas || {};

  const icone = (nome) => E.ui.icone(nome);

  // Alterna senha visível/oculta (chamado pelo app.js no botão do olho).
  function alternarSenha(botao) {
    const campo = botao.closest(".campo-icone").querySelector("input");
    const mostrar = campo.type === "password";
    campo.type = mostrar ? "text" : "password";
    botao.innerHTML = icone(mostrar ? "olhoFechado" : "olho");
    botao.setAttribute("aria-label", mostrar ? "Esconder senha" : "Mostrar senha");
  }

  E.telas.login = {
    alternarSenha,

    render() {
      return `<div class="login-pagina">
        <div class="login-foto" aria-hidden="true"></div>
        <div class="login-card">
          <div class="login-marca">
            <h1>Consulta de Escala</h1>
          </div>
          <p class="login-chamada">Faça login para continuar</p>

          <form id="form-login" autocomplete="off" novalidate>
            <label class="campo-icone">
              <span class="visualmente-oculto">Matrícula</span>
              ${icone("pessoa")}
              <input name="matricula" inputmode="numeric" placeholder="Matrícula" required>
            </label>
            <label class="campo-icone">
              <span class="visualmente-oculto">Senha</span>
              ${icone("cadeado")}
              <input name="senha" type="password" placeholder="Senha" required>
              <button type="button" class="ver-senha" data-acao="ver-senha" aria-label="Mostrar senha">${icone("olho")}</button>
            </label>
            <p class="login-erro" id="login-erro" role="alert"></p>
            <button class="btn btn-primario btn-largo" type="submit">Entrar</button>
          </form>

          <p class="login-nota">Protótipo com dados fictícios.</p>
        </div>
      </div>`;
    },
  };
})(window.Escala);

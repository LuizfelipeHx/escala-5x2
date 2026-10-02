/* Tela de login (simulado). */
(function (E) {
  "use strict";

  E.telas = E.telas || {};

  // Um acesso de demonstração por papel, cobrindo os 3 tipos de escala.
  function acessosDemo() {
    const R = E.escala;
    const primeiroDoTipo = (tipo) => R.unidades().find((u) => u.tipoEscala === tipo);
    const colaborador = (tipo) => {
      const u = primeiroDoTipo(tipo);
      const p = u && u.equipe[0];
      return p && { matricula: p.matricula, nome: p.nome, detalhe: `${p.funcao} · ${u.nome}`, tipo: R.tipoDe(u).nome };
    };
    const g = E.dados.gestores[0];
    const sup = R.unidades()[0];
    return [
      g && { matricula: g.matricula, nome: g.nome, detalhe: `${g.funcao} · todos os CDDs`, tipo: "Visão geral" },
      sup && { matricula: sup.supervisor.matricula, nome: sup.supervisor.nome, detalhe: `${sup.supervisor.funcao} · ${sup.nome}`, tipo: "Supervisão" },
      colaborador("rotativa"),
      colaborador("fixa"),
      colaborador("mensal"),
    ].filter(Boolean);
  }

  E.telas.login = {
    render() {
      const U = E.ui;
      return `<div class="login-pagina">
        <div class="login-card">
          <div class="login-marca">
            <div class="logo">5x2</div>
            <div><h1>Consulta de Escala</h1><p>Equipe de Entrega · ${E.escala.unidades().length} CDDs</p></div>
          </div>

          <form id="form-login" autocomplete="off" novalidate>
            <label>Matrícula<input name="matricula" inputmode="numeric" placeholder="Ex.: 10001" required></label>
            <label>Senha<input name="senha" type="password" placeholder="Sua senha" required></label>
            <p class="login-erro" id="login-erro" role="alert"></p>
            <button class="btn btn-primario btn-largo" type="submit">Entrar</button>
          </form>

          <div class="demo">
            <p>Acessos de demonstração <span>(senha ${U.esc(E.dados.senhaDemo)})</span></p>
            ${acessosDemo().map((a) => `<button class="demo-item" data-acao="demo" data-matricula="${U.esc(a.matricula)}">
                ${U.avatar(a.nome)}
                <span><b>${U.esc(a.nome)}</b><small>${U.esc(a.detalhe)}</small></span>
                <span class="demo-tipo">${U.esc(a.tipo)}</span>
              </button>`).join("")}
          </div>

          <p class="login-nota">Login simulado para apresentação, com dados fictícios. Na versão final, o acesso será validado por um servidor.</p>
        </div>
      </div>`;
    },
  };
})(window.Escala);

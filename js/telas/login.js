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
      return p && { matricula: p.matricula, nome: p.nome, detalhe: `${p.funcao} · ${u.nome} · ${R.tipoDe(u).nome.toLowerCase()}`, tipo: "Colaborador" };
    };
    // Dois exemplos de liderança: quem acompanha mais CDDs e quem acompanha só um.
    const lideres = [...E.dados.liderancas].sort((a, b) => R.unidadesDoLider(b).length - R.unidadesDoLider(a).length);
    const lider = (l) => {
      if (!l) return null;
      const ids = R.unidadesDoLider(l);
      const onde = ids.length > 1 ? `${ids.length} CDDs` : R.unidade(ids[0]).nome;
      return { matricula: l.matricula, nome: l.nome, detalhe: `${l.cargo} · ${onde}`, tipo: "Liderança" };
    };
    return [
      lider(lideres[0]),
      lider(lideres.find((l) => R.unidadesDoLider(l).length === 1)),
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
            ${["Liderança", "Colaborador"].map((grupo) => `<p class="demo-grupo">${grupo}</p>
              ${acessosDemo().filter((a) => a.tipo === grupo).map((a) => `<button class="demo-item" data-acao="demo" data-matricula="${U.esc(a.matricula)}">
                ${U.avatar(a.nome)}
                <span><b>${U.esc(a.nome)}</b><small>${U.esc(a.detalhe)}</small></span>
              </button>`).join("")}`).join("")}
          </div>

          <p class="login-nota">Login simulado para apresentação, com dados fictícios. Na versão final, o acesso será validado por um servidor.</p>
        </div>
      </div>`;
    },
  };
})(window.Escala);

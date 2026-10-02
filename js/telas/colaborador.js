/* Tela do colaborador: só a própria escala. */
(function (E) {
  "use strict";

  E.telas.colaborador = {
    render(estado) {
      const D = E.datas, R = E.escala, U = E.ui;
      const p = R.porMatricula(estado.usuario.matricula);
      const hoje = D.hoje();
      const s = R.situacao(p, hoje);
      const f = R.feriado(hoje);
      const detalhe = {
        trabalho: () => `Próxima folga: ${D.rotulo(R.proximaFolga(p, hoje))}`,
        pendente: () => "Aguarde a publicação da escala pela supervisão.",
      }[s]?.() ?? `Você volta em ${D.rotulo(R.proximoRetorno(p, hoje))}`;

      const parceiro = R.parceiroDeRota(p);
      const kpiParceiro = parceiro
        ? U.kpi(`Parceiro de rota (${parceiro.funcao.toLowerCase()})`, U.esc(U.primeiroNome(parceiro.nome)), "", U.chip(R.situacao(parceiro, hoje)))
        : "";

      return `
        <div class="hero s-${s}">
          <div>
            <small>${D.extenso(hoje)}${f ? ` · Feriado: ${U.esc(f.nome)}` : ""}</small>
            <h2>${R.SITUACOES[s].frase}</h2>
            <p>${detalhe}</p>
          </div>
          ${U.chip(s)}
        </div>
        <div class="resumo resumo-3">${U.kpisProximas(p)}${kpiParceiro}</div>
        <h3 class="secao">Minha escala do mês</h3>
        ${U.painelMensal(p, estado.mes)}`;
    },
  };
})(window.Escala);

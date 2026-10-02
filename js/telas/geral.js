/* Gestor: visão consolidada dos CDDs. */
(function (E) {
  "use strict";

  const DIAS_ANALISADOS = 28;

  function resumoUnidade(u, hoje) {
    const R = E.escala, D = E.datas;
    const dias = Array.from({ length: DIAS_ANALISADOS }, (_, i) => D.addDias(hoje, i));
    const status = dias.map((d) => R.statusDia(u, d));
    return {
      emOperacao: u.equipe.filter((p) => R.trabalha(p, hoje)).length,
      alertas: status.filter((s) => s === "baixa").length,
      aPublicar: status.filter((s) => s === "pendente").length,
      semDomingo: R.semDomingoDeFolga(u, hoje).length,
      proximoMes: R.publicacao(u, D.addMeses(hoje, 1)),
    };
  }

  E.telas.geral = {
    render() {
      const D = E.datas, R = E.escala, U = E.ui;
      const hoje = D.hoje();
      const unidades = R.unidades();
      const resumos = unidades.map((u) => ({ u, r: resumoUnidade(u, hoje) }));
      const total = unidades.reduce((n, u) => n + u.equipe.length, 0);
      const emOperacao = resumos.reduce((n, x) => n + x.r.emOperacao, 0);
      const comAlerta = resumos.filter((x) => x.r.alertas || x.r.semDomingo || (x.r.proximoMes && !x.r.proximoMes.publicada)).length;
      const nomeProxMes = D.MESES[D.addMeses(hoje, 1).getMonth()].toLowerCase();

      const linha = (rotulo, valor, ruim) =>
        `<div class="cdd-linha"><span>${rotulo}</span><b class="${ruim ? "ruim" : ""}">${valor}</b></div>`;

      const cartoes = resumos.map(({ u, r }) => `<div class="cdd">
        <div class="cdd-topo">
          <div><h3>${U.esc(u.nome)} <small>${U.esc(u.uf)}</small></h3><span class="sub">Supervisão: ${U.esc(u.supervisor.nome)}</span></div>
          ${U.chipTipo(u)}
        </div>
        ${linha("Em operação hoje", `${r.emOperacao} de ${u.equipe.length}`, false)}
        ${linha(`Dias abaixo do mínimo (${DIAS_ANALISADOS} dias)`, r.alertas, r.alertas > 0)}
        ${linha(`Sem domingo de folga (${R.SEMANAS_DOMINGO} semanas)`, r.semDomingo, r.semDomingo > 0)}
        ${r.proximoMes ? linha(`Escala de ${nomeProxMes}`, r.proximoMes.publicada ? `publicada em ${D.curto(r.proximoMes.publicadaEm)}` : "aguardando publicação", !r.proximoMes.publicada) : ""}
        <button class="btn btn-largo" data-acao="abrir-unidade" data-unidade="${u.id}">Abrir ${U.esc(u.nome)} ›</button>
      </div>`).join("");

      const tipos = Object.keys(E.regras).map((tipo) => {
        const doTipo = unidades.filter((u) => u.tipoEscala === tipo);
        if (!doTipo.length) return "";
        return `<tr><td>${U.chipTipo(doTipo[0])}</td><td class="esquerda">${doTipo.map((u) => U.esc(u.nome)).join(", ")}</td>
          <td class="esquerda">${U.esc(E.regras[tipo].resumo)}</td></tr>`;
      }).join("");

      return `
        <div class="ctrl"><h2 class="titulo-data">Visão geral · ${D.extenso(hoje)}</h2></div>
        <div class="resumo resumo-4">
          ${U.kpi("Unidades", unidades.length)}
          ${U.kpi("Colaboradores", total)}
          ${U.kpi("Em operação hoje", emOperacao, "k-trabalho")}
          ${U.kpi("Unidades com atenção", comAlerta, comAlerta ? "k-atestado" : "k-trabalho")}
        </div>
        <div class="cdds">${cartoes}</div>
        <h3 class="secao">Tipos de escala</h3>
        <div class="tabela-wrap"><table class="tabela-tipos">
          <thead><tr><th>Tipo</th><th class="esquerda">Unidades</th><th class="esquerda">Como funciona</th></tr></thead>
          <tbody>${tipos}</tbody>
        </table></div>`;
    },
  };
})(window.Escala);

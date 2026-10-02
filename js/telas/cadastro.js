/* Liderança: cadastro do CDD (tipo de jornada), da equipe com a escala de
   cada pessoa e das ocorrências (férias, atestado, afastamento, falta).
   Esta tela só monta HTML e lê formulários; quem grava é o repositório. */
(function (E) {
  "use strict";

  const D = E.datas;
  const POSICOES = ["Seg+Ter", "Ter+Qua", "Qua+Qui", "Qui+Sex", "Sex+Sáb", "Sáb+Dom", "Seg+Dom"];
  const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0];
  const TIPOS_OCORRENCIA = {
    ferias: "Férias",
    atestado: "Atestado médico",
    afastamento: "Afastamento (INSS, licença)",
    falta: "Falta injustificada",
  };

  const U = () => E.ui;
  const nomeDoMes = (chave) => D.mesAno(D.deIso(`${chave}-01`));

  /* ---------- Peças de formulário ---------- */
  const campo = (rotulo, controle, dica = "") =>
    `<label class="campo"><span>${rotulo}</span>${controle}${dica ? `<small>${dica}</small>` : ""}</label>`;

  const entrada = (nome, valor = "", extra = "") =>
    `<input name="${nome}" value="${U().esc(valor ?? "")}" ${extra}>`;

  const opcoes = (lista, marcado) =>
    lista.map(([v, t]) => `<option value="${U().esc(v)}"${String(v) === String(marcado) ? " selected" : ""}>${U().esc(t)}</option>`).join("");

  // Botões de dia da semana (no máximo 2 marcados, controlado em app.js).
  const seletorDias = (nome, marcados = []) =>
    `<div class="dias" data-max="2">${ORDEM_DIAS.map((d) => `<label class="dia-op">
      <input type="checkbox" name="${nome}" value="${d}"${marcados.includes(d) ? " checked" : ""}><span>${D.DIAS[d]}</span></label>`).join("")}</div>`;

  function camposEscala(u, p) {
    if (u.tipoEscala === "fixa") return campo("Folgas fixas (escolha 2 dias)", seletorDias("folgas", p?.folgas));
    if (u.tipoEscala === "rotativa") {
      return campo("Folgas na semana de início do ciclo",
        `<select name="posicaoInicial">${opcoes(POSICOES.map((t, i) => [i, t]), p?.posicaoInicial ?? 0)}</select>`,
        `O ciclo começou em ${D.curto(D.deIso(u.inicioCiclo))}. A cada semana o par de folgas avança 1 dia.`);
    }
    // Só os meses recentes e futuros; os antigos ficam guardados sem mudança.
    const desde = D.chaveMes(D.addMeses(D.hoje(), -2));
    const meses = Object.keys(u.meses).sort().filter((k) => k >= desde);
    if (!meses.length) return '<p class="nota">Nenhum mês recente publicado nesta unidade.</p>';
    return `<fieldset class="campo campo-meses"><legend>Folgas em cada mês publicado (2 dias)</legend>
      ${meses.map((k) => `<div class="mes-op"><span>${nomeDoMes(k)}</span>${seletorDias(`mes-${k}`, u.meses[k].folgas[p?.matricula] || [])}</div>`).join("")}
      <small>Meses antes da admissão podem ficar em branco. Meses mais antigos ficam guardados e não aparecem aqui.</small></fieldset>`;
  }

  const rodapeForm = (extra = "") => `<div class="form-erros" role="alert"></div>
    <div class="form-acoes">${extra}<span class="espaco"></span>
      <button type="button" class="btn" data-acao="fechar-dialogo">Cancelar</button>
      <button class="btn btn-primario" type="submit">Salvar</button></div>`;

  /* ---------- Formulários (abertos no <dialog>) ---------- */
  function formPessoa(u, p) {
    const funcoes = E.escala.funcoes(u).map((f) => [f, f]);
    const excluir = p ? `<button type="button" class="btn btn-perigo" data-acao="excluir-pessoa" data-alvo="${U().esc(p.matricula)}">Excluir cadastro</button>` : "";
    return `<form id="form-pessoa" class="form" data-unidade="${u.id}" data-original="${U().esc(p?.matricula || "")}" novalidate>
      <h2>${p ? "Editar colaborador" : "Novo colaborador"} <small>${U().esc(u.nome)} · ${U().esc(E.escala.tipoDe(u).nome)}</small></h2>
      <div class="form-grade">
        ${campo("Nome completo", entrada("nome", p?.nome, "required"))}
        ${campo("Matrícula", entrada("matricula", p?.matricula, 'inputmode="numeric" required'))}
        ${campo("PIS ou CPF", entrada("pis", p?.pis, 'inputmode="numeric" maxlength="14" required'), "Usado para cruzar com o AFDT.")}
        ${campo("Função", `<select name="funcao">${opcoes(funcoes, p?.funcao)}</select>`)}
        ${campo("Rota", entrada("rota", p?.rota, "required"))}
        ${campo("Admissão", entrada("admissao", p?.admissao, 'type="date"'))}
        ${p ? campo("Desligamento", entrada("desligamento", p?.desligamento, 'type="date"'), "Deixe em branco se está ativo.") : ""}
      </div>
      ${camposEscala(u, p)}
      ${rodapeForm(excluir)}
    </form>`;
  }

  function formOcorrencia(u) {
    const hoje = D.iso(D.hoje());
    const pessoas = E.escala.equipeAtiva(u, D.hoje()).map((p) => [p.matricula, `${p.nome} (${p.funcao})`]);
    return `<form id="form-ocorrencia" class="form" data-unidade="${u.id}" novalidate>
      <h2>Lançar ocorrência <small>${U().esc(u.nome)}</small></h2>
      <div class="form-grade">
        ${campo("Colaborador", `<select name="matricula">${opcoes(pessoas)}</select>`)}
        ${campo("Tipo", `<select name="tipo">${opcoes(Object.entries(TIPOS_OCORRENCIA), "ferias")}</select>`)}
        ${campo("Início", entrada("inicio", hoje, 'type="date" required'))}
        ${campo("Fim", entrada("fim", hoje, 'type="date" required'))}
      </div>
      <p class="nota">Só a <b>falta injustificada</b> conta como absenteísmo. Férias, atestados e afastamentos são ausências justificadas. A falta só pode ser lançada em dia de trabalho da escala.</p>
      ${rodapeForm()}
    </form>`;
  }

  /* ---------- Leitura dos formulários ---------- */
  function lerPessoa(form, u) {
    const f = new FormData(form);
    const texto = (k) => (f.get(k) || "").toString().trim();
    const dias = (k) => f.getAll(k).map(Number);
    const p = {
      nome: texto("nome"), matricula: texto("matricula"), pis: texto("pis"),
      funcao: texto("funcao"), rota: texto("rota"),
      admissao: texto("admissao"), desligamento: texto("desligamento"),
    };
    if (u.tipoEscala === "fixa") p.folgas = dias("folgas");
    if (u.tipoEscala === "rotativa") p.posicaoInicial = Number(f.get("posicaoInicial"));
    if (u.tipoEscala === "mensal") {
      // Lê só os meses que estavam no formulário (os antigos não aparecem e não mudam).
      const noFormulario = [...new Set([...form.querySelectorAll('input[name^="mes-"]')].map((i) => i.name.slice(4)))];
      p.folgasMensais = Object.fromEntries(noFormulario.map((k) => [k, dias(`mes-${k}`)]));
    }
    return p;
  }

  function lerOcorrencia(form) {
    const f = new FormData(form);
    return { matricula: f.get("matricula"), tipo: f.get("tipo"), inicio: f.get("inicio"), fim: f.get("fim") };
  }

  function lerUnidade(form, u) {
    const f = new FormData(form);
    const coberturaMinima = Object.fromEntries(E.escala.funcoes(u).map((fn) => [fn, Number(f.get(`min-${fn}`))]));
    return { tipoEscala: f.get("tipoEscala"), inicioCiclo: f.get("inicioCiclo") || undefined, coberturaMinima };
  }

  /* ---------- Página ---------- */
  function blocoUnidade(u) {
    const tipos = Object.keys(E.regras).map((t) => [t, E.regras[t].nome]);
    return `<section class="painel bloco">
      <div class="bloco-topo"><h3>Tipo de jornada do CDD</h3></div>
      <form id="form-unidade" class="form-linha" data-unidade="${u.id}" novalidate>
        ${campo("Jornada", `<select name="tipoEscala">${opcoes(tipos, u.tipoEscala)}</select>`)}
        ${E.escala.funcoes(u).map((fn) => campo(`Mínimo de ${fn.toLowerCase()}s/dia`, entrada(`min-${fn}`, u.coberturaMinima[fn], 'type="number" min="0" max="99"'))).join("")}
        ${u.tipoEscala === "rotativa" ? campo("Início do ciclo", entrada("inicioCiclo", u.inicioCiclo, 'type="date"'), "Precisa ser segunda-feira.") : ""}
        <button class="btn btn-primario" type="submit">Salvar jornada</button>
        <div class="form-erros" role="alert"></div>
      </form>
      <p class="nota">A jornada define quais dias cada pessoa estava prevista para trabalhar. É isso que separa <b>folga</b> de <b>falta</b> nas análises. Ao trocar o tipo, revise a escala de cada pessoa abaixo.</p>
    </section>`;
  }

  function situacaoCadastro(p) {
    const hoje = D.iso(D.hoje());
    if (p.desligamento && p.desligamento < hoje) return `<span class="status status-pend">Desligado em ${D.curto(D.deIso(p.desligamento))}</span>`;
    if (p.admissao && p.admissao > hoje) return `<span class="status status-pend">Admissão em ${D.curto(D.deIso(p.admissao))}</span>`;
    return '<span class="status status-ok">Ativo</span>';
  }

  function blocoEquipe(u) {
    const hoje = D.hoje();
    const linhas = u.equipe.map((p) => {
      const ativo = E.escala.ativoEm(p, hoje);
      const regra = E.escala.descreverRegra(p, { hoje, mes: D.inicioDoMes(hoje) })[0];
      return `<tr class="${ativo ? "" : "apagado"}">
        <td>${U().esc(p.nome)}<small>Matrícula ${U().esc(p.matricula)} · PIS/CPF ${U().esc(p.pis || "-")}</small></td>
        <td class="esquerda">${U().esc(p.funcao)}<small>${U().esc(p.rota)}</small></td>
        <td class="esquerda">${U().esc(regra)}</td>
        <td>${situacaoCadastro(p)}</td>
        <td class="acoes">
          <button class="btn btn-mini" data-acao="editar-pessoa" data-alvo="${U().esc(p.matricula)}">Editar</button>
          ${ativo ? `<button class="btn btn-mini" data-acao="desligar-pessoa" data-alvo="${U().esc(p.matricula)}">Desligar</button>` : ""}
        </td>
      </tr>`;
    }).join("");
    return `<section class="bloco">
      <div class="bloco-topo"><h3>Equipe (${E.escala.equipeAtiva(u, hoje).length} ativos)</h3>
        <button class="btn btn-primario" data-acao="nova-pessoa">+ Novo colaborador</button></div>
      <div class="tabela-wrap"><table class="tabela-cadastro">
        <thead><tr><th>Colaborador</th><th class="esquerda">Função e rota</th><th class="esquerda">Escala</th><th>Situação</th><th></th></tr></thead>
        <tbody>${linhas || `<tr><td colspan="5">${U().vazio("Nenhum colaborador cadastrado.")}</td></tr>`}</tbody>
      </table></div>
    </section>`;
  }

  function blocoOcorrencias(u) {
    const nome = (m) => E.escala.porMatricula(m)?.nome || m;
    const dias = (a) => D.diasEntre(D.deIso(a.inicio), D.deIso(a.fim)) + 1;
    const linhas = u.ausencias
      .map((a, indice) => ({ a, indice }))
      .sort((x, y) => (x.a.inicio < y.a.inicio ? 1 : -1))
      .map(({ a, indice }) => `<tr>
        <td>${U().esc(nome(a.matricula))}</td>
        <td>${U().chip(a.tipo)}</td>
        <td>${D.curto(D.deIso(a.inicio))}${a.fim !== a.inicio ? ` a ${D.curto(D.deIso(a.fim))}` : ""}<small>${D.deIso(a.inicio).getFullYear()}</small></td>
        <td>${dias(a)}</td>
        <td class="acoes"><button class="btn btn-mini" data-acao="excluir-ocorrencia" data-indice="${indice}">Excluir</button></td>
      </tr>`).join("");
    return `<section class="bloco">
      <div class="bloco-topo"><h3>Ocorrências (${u.ausencias.length})</h3>
        <button class="btn btn-primario" data-acao="nova-ocorrencia">+ Lançar ocorrência</button></div>
      <div class="tabela-wrap"><table class="tabela-cadastro">
        <thead><tr><th>Colaborador</th><th>Tipo</th><th>Período</th><th>Dias</th><th></th></tr></thead>
        <tbody>${linhas || `<tr><td colspan="5">${U().vazio("Nenhuma ocorrência lançada.")}</td></tr>`}</tbody>
      </table></div>
    </section>`;
  }

  function blocoDados() {
    const personalizado = E.repositorio.personalizado();
    return `<section class="painel bloco">
      <div class="bloco-topo"><h3>Dados deste navegador</h3></div>
      <p class="nota">${personalizado
        ? "<b>Este navegador tem alterações salvas.</b> Elas ficam só aqui: quem abrir o site em outro aparelho vê os dados de exemplo."
        : "Você está vendo os <b>dados de exemplo</b>. O que você cadastrar fica salvo só neste navegador."}</p>
      <div class="form-acoes">
        <button class="btn" data-acao="exportar">Exportar dados (.json)</button>
        <label class="btn">Importar dados<input type="file" id="arquivo-importar" accept=".json,application/json" hidden></label>
        <button class="btn btn-perigo" data-acao="restaurar"${personalizado ? "" : " disabled"}>Restaurar dados de exemplo</button>
      </div>
    </section>`;
  }

  E.telas.cadastro = {
    formPessoa, formOcorrencia, lerPessoa, lerOcorrencia, lerUnidade,

    render(estado) {
      const u = U().unidadeAtual(estado);
      return `${blocoUnidade(u)}${blocoEquipe(u)}${blocoOcorrencias(u)}${blocoDados()}`;
    },
  };
})(window.Escala);

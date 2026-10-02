# Módulos

Todos os módulos se registram no objeto global `window.Escala`. A ordem de carregamento é a desta tabela (ver `index.html`).

| Arquivo | Expõe | Responsabilidade | Depende de |
|---|---|---|---|
| `dados/geral.js` | `Escala.dados` | Senha de demonstração, gestores, feriados e a lista de unidades | nada |
| `dados/unidades/*.js` | item em `Escala.dados.unidades` | Uma unidade: tipo de escala, cobertura mínima, supervisor, equipe, ausências e dados do tipo | `dados/geral.js` |
| `js/core/datas.js` | `Escala.datas` | Criar, somar, comparar e formatar datas | nada |
| `js/core/documentos.js` | `Escala.documentos` | Validação de PIS e CPF (dígito verificador) | nada |
| `js/core/regras/base.js` | `Escala.regras`, `Escala.regrasBase` | Contrato das regras e validações comuns | nada |
| `js/core/regras/fixa.js` | `Escala.regras.fixa` | Escala fixa | `datas`, `regrasBase` |
| `js/core/regras/rotativa.js` | `Escala.regras.rotativa` | Escala rotativa semanal (também expõe `folgasDaSemana`) | `datas` |
| `js/core/regras/mensal.js` | `Escala.regras.mensal` | Escala mensal publicada | `datas`, `regrasBase` |
| `js/core/escala.js` | `Escala.escala` | Situação do dia, ausências, próximas folgas, cobertura, alertas e validação dos dados | `dados`, `datas`, `regras` |
| `dados/historico-ficticio.js` | `Escala.configHistorico` | Parâmetros do histórico de ponto fictício (período, taxas, padrões, reincidentes) | nada |
| `js/core/historico.js` | `Escala.historico` | Ocorrências de ponto, apuração dos dias previstos, análises e risco por dia | `datas`, `escala`, `configHistorico` |
| `js/core/repositorio.js` | `Escala.repositorio` | Carregar (exemplo ou navegador), alterar com transação, exportar, importar e restaurar | `dados`, `escala`, `documentos` |
| `js/core/sessao.js` | `Escala.sessao` | Login simulado com duas visões: colaborador e liderança (alcance pelos CDDs acompanhados) | `dados`, `escala` |
| `js/ui/componentes.js` | `Escala.ui` | Peças de HTML: chips, indicadores, avisos, faixa da unidade, linha de pessoa, calendário, painel mensal | `datas`, `escala` |
| `js/ui/layout.js` | `Escala.ui.layout` | Moldura da área logada | `ui`, `escala` |
| `js/telas/login.js` | `Escala.telas.login` | Login com acessos de demonstração (um por perfil e tipo) | `ui`, `escala` |
| `js/telas/colaborador.js` | `Escala.telas.colaborador` | Própria escala do colaborador | `ui`, `escala`, `datas` |
| `js/telas/hoje.js` | `Escala.telas.hoje` | Em operação e fora num dia | `ui`, `escala`, `datas` |
| `js/telas/semana.js` | `Escala.telas.semana` | Grade semanal e totais por função | `ui`, `escala`, `datas` |
| `js/telas/cobertura.js` | `Escala.telas.cobertura` | 28 dias de cobertura, alertas e domingos | `ui`, `escala`, `datas` |
| `js/telas/individual.js` | `Escala.telas.individual` | Escala do mês de qualquer pessoa da unidade | `ui`, `escala`, `datas` |
| `js/telas/geral.js` | `Escala.telas.geral` | Visão consolidada dos CDDs (coordenador e gerente) | `ui`, `escala`, `datas`, `regras` |
| `js/telas/absenteismo.js` | `Escala.telas.absenteismo` | Histórico (gráficos e tabela mensal), calendário de risco e visão por colaborador com detalhe da pessoa | `ui`, `historico`, `datas` |
| `js/telas/cadastro.js` | `Escala.telas.cadastro` | Cadastro do CDD, equipe e ocorrências; formulários e leitura deles | `ui`, `escala`, `datas`, `regras`, `repositorio` |
| `js/app.js` | nada | Estado, abas por perfil, unidade selecionada, ações e eventos | todos |

## Contrato das telas

Toda tela é um objeto com `render(estado)` que **devolve HTML** e não registra eventos. Atributos usados nos botões:

- `data-acao="nome"`: executa a ação de mesmo nome em `ACOES` (`app.js`).
- `data-aba="id"`: troca de aba.
- `data-id="matrícula"`: abre a escala individual da pessoa (supervisor e gestor).
- `data-unidade="id"`: com `data-acao="abrir-unidade"`, abre um CDD (gestor).

## Funções principais de `Escala.escala`

| Função | Retorna |
|---|---|
| `situacao(pessoa, dia)` | `trabalho`, `folga`, `ferias`, `atestado` ou `pendente` |
| `situacaoNaEscala(pessoa, dia)` | Igual, ignorando ausências |
| `unidades()`, `unidade(id)`, `unidadeDe(pessoa)` | Unidades |
| `tipoDe(unidade)` | Nome e resumo do tipo de escala |
| `proximaFolga`, `proximoRetorno`, `proximoDomingoDeFolga` | Próxima data ou `null` |
| `descreverRegra(pessoa, { hoje, mes })` | Frases da regra da pessoa |
| `publicacao(unidade, mes)` | Situação de publicação (só mensal) |
| `cobertura(unidade, dia)` | Por função: em operação, total, mínimo, pendente, ok |
| `statusDia(unidade, dia)` | `ok`, `baixa` ou `pendente` |
| `semDomingoDeFolga(unidade, dia)` | Pessoas sem domingo de folga nas próximas 8 semanas |
| `validarDados()` | Problemas nos arquivos de dados |

## Testes

`testes.html` carrega dados e núcleo (sem interface) e roda 49 testes: tipos de escala, regras comuns, histórico e risco, absenteísmo por colaborador (episódios, Bradford, teste binomial, reincidentes e controle de acaso), login e visões, PIS/CPF e cadastro.

## Funções principais de `Escala.historico`

| Função | Retorna |
|---|---|
| `registros(unidade)` | Dias previstos apurados: presença, falta, atestado ou falha de registro |
| `resumoPeriodo`, `porDiaSemana`, `porSemanaDoMes`, `porMes` | Agrupamentos com previstos, faltas e taxa |
| `riscoDoDia`, `riscoDoMes` | Nível, estimativa, média da unidade e os 3 sinais |
| `porColaborador(unidade, janela, { dia, mes })` | Por pessoa: taxa, taxa 90 dias, episódios, Bradford 90 dias, filtro, padrões e sinal |
| `detalheColaborador(unidade, matricula)` | Histórico inteiro da pessoa: meses, dias da semana, episódios, atestados e padrões |
| `episodios`, `bradford`, `caudaBinomial`, `padroes` | Peças das contas (testadas isoladamente) | Usa uma chave de armazenamento própria, então nunca mexe no que o usuário cadastrou. Abrir depois de qualquer mudança em `dados/` ou `js/core/`.

## Funções principais de `Escala.repositorio`

Todas devolvem `{ ok: true }` ou `{ erros: [...] }`.

| Função | O que faz |
|---|---|
| `salvarUnidade(id, { tipoEscala, coberturaMinima, inicioCiclo })` | Tipo de jornada e cobertura do CDD |
| `salvarPessoa(unidadeId, pessoa, matriculaOriginal)` | Inclui ou edita (renomeia a matrícula em todo o histórico) |
| `desligarPessoa(matricula, data)` / `excluirPessoa(matricula)` | Desliga mantendo o histórico / apaga tudo |
| `salvarOcorrencia(unidadeId, ocorrencia)` / `excluirOcorrencia(unidadeId, indice)` | Férias, atestado, afastamento, falta |
| `exportar()` / `importar(texto)` / `restaurarExemplo()` | Backup em JSON e volta aos dados de exemplo |

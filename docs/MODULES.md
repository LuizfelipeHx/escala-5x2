# Módulos

Todos os módulos se registram no objeto global `window.Escala`. A ordem de carregamento é a desta tabela.

| Arquivo | Expõe | Responsabilidade | Depende de |
|---|---|---|---|
| `dados/equipe.js` | `Escala.dados` | Configuração, equipe, supervisores, ausências e feriados (fictícios) | nada |
| `js/core/datas.js` | `Escala.datas` | Criar, somar, comparar e formatar datas. Sem regra de negócio | nada |
| `js/core/escala.js` | `Escala.escala` | Regra 5x2, rodízio de domingo, ausências, próximas folgas, cobertura e validação dos dados | `dados`, `datas` |
| `js/core/sessao.js` | `Escala.sessao` | Login simulado (`entrar`, `sair`, `atual`) | `dados`, `escala` |
| `js/ui/componentes.js` | `Escala.ui` | Peças de HTML: chip, avatar, indicador, avisos, linha de pessoa, calendário, painel mensal, filtro da equipe | `datas`, `escala` |
| `js/ui/layout.js` | `Escala.ui.layout` | Moldura da área logada (cabeçalho, abas, filtros, rodapé) | `ui`, `escala` |
| `js/telas/login.js` | `Escala.telas.login` | Tela de login com acessos de demonstração | `ui`, `dados` |
| `js/telas/colaborador.js` | `Escala.telas.colaborador` | Tela do colaborador: hoje, próximas folgas, parceiro de rota e mês | `ui`, `escala`, `datas` |
| `js/telas/hoje.js` | `Escala.telas.hoje` | Supervisor: em operação e fora num dia | `ui`, `escala`, `datas` |
| `js/telas/semana.js` | `Escala.telas.semana` | Supervisor: grade semanal e totais por função | `ui`, `escala`, `datas` |
| `js/telas/cobertura.js` | `Escala.telas.cobertura` | Supervisor: 28 dias de cobertura e rodízio de domingo | `ui`, `escala`, `datas` |
| `js/telas/individual.js` | `Escala.telas.individual` | Supervisor: escala do mês de qualquer pessoa | `ui`, `escala`, `datas` |
| `js/app.js` | nada | Estado, abas por perfil, ações dos botões e eventos | todos |

## Contrato das telas

Toda tela é um objeto com `render(estado)` que **devolve uma string de HTML** e não registra eventos. Botões usam atributos:

- `data-acao="nome"`: executa a ação de mesmo nome em `ACOES` (`app.js`).
- `data-aba="id"`: troca de aba.
- `data-id="n"`: abre a escala individual da pessoa (só supervisor).

## Funções principais de `Escala.escala`

| Função | Retorna |
|---|---|
| `situacao(pessoa, data)` | `"trabalho"`, `"folga"`, `"ferias"` ou `"atestado"` |
| `situacaoNaEscala(pessoa, data)` | Igual, mas ignorando ausências |
| `grupoDeFolgaNoDomingo(data)` | Grupo que folga no domingo daquela semana |
| `proximaFolga`, `proximoRetorno`, `proximoDomingoDeFolga` | Próxima data ou `null` |
| `cobertura(data)` | Lista por função: em operação, total, mínimo e se está ok |
| `resumoMes(pessoa, inicioDoMes)` | Contagem de cada situação no mês |
| `validarDados()` | Lista de problemas no arquivo de dados |

## Testes

`testes.html` carrega dados e núcleo (sem interface) e confere as regras. Abrir depois de qualquer mudança em `dados/` ou `js/core/`.

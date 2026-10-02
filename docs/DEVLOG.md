# Devlog

## 02/10/2026: v0.3, publicado para o time testar

- Código versionado no GitHub (`LuizfelipeHx/escala-5x2`) e publicado pelo GitHub Pages.
- Páginas marcadas com `noindex` para não aparecerem em buscadores.
- README com o link online e o aviso de que a versão pública só pode ter dados fictícios.
- **Decisão:** repositório público, porque o Pages gratuito exige isso e não há dado real. Com dados reais, o caminho é a Fase 2 (login com servidor).

## 01/10/2026: v0.2, login, rodízio e cobertura

**Feito**
- Código reorganizado em camadas (dados, núcleo, interface, telas, app) e estilos separados em três arquivos.
- Login simulado com dois perfis: colaborador (só a própria escala) e supervisor (equipe toda).
- Regra 5x2 com folga fixa, folga extra e rodízio de domingo em 3 grupos.
- Férias, atestados e feriados, com cores próprias no calendário.
- Tela de cobertura: 28 dias à frente, alerta abaixo do mínimo e calendário do rodízio de domingo.
- Validação do arquivo de dados com aviso na tela.
- `testes.html` com 10 testes das regras.
- Documentação: README, arquitetura, módulos, roadmap, TODO e este devlog.

**Validado**
- 10 de 10 testes passando, servido localmente e abrindo direto pelo arquivo (`file://`) no Edge.
- Login com senha errada mostra erro; os 3 acessos de demonstração entram no perfil certo.
- Telas de supervisor: Hoje, Semana (com feriado de 12/10 e férias), Cobertura (4 dias de alerta em outubro) e Escala individual.
- Busca filtra a lista e o clique no nome abre a escala individual.
- Celular (375 px): sem rolagem lateral, calendário e indicadores legíveis.
- Nenhum erro no console.

**Decisões**
- Sem módulos ES nem `fetch`, porque o time abre o zip por `file://` (ver ARCHITECTURE.md).
- A moldura é desenhada uma vez por login; só o conteúdo é redesenhado, para a busca não perder o foco.

## 30/09/2026: v0.1, primeiro esboço

- Página única com abas Hoje, Semana e Mês, 10 pessoas fictícias e folgas fixas.

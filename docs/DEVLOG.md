# Devlog

## 02/10/2026: v0.7, login novo e marca limpa

**Pedido:** foto da Corona no login (pedido do próprio time Ambev), sem o texto "CORONA"; tirar o quadrado amarelo "5x2"; tirar a lista de acessos de demonstração da tela.

**Feito**
- Foto recortada acima do texto "CORONA" (sem retoque) e sem os cantos arredondados; otimizada para 65 KB em `img/login-fundo.webp`.
- Login em tela dividida no computador (foto inteira à esquerda, login à direita) e foto no topo com o cartão por cima no celular.
- Marca só tipográfica: "Consulta de Escala" com filete dourado, no login e no cabeçalho. Novo ícone de aba (calendário) em `img/icone.svg`.
- Login sem a lista de acessos; os acessos ficam no README. Código e estilos da lista removidos.

**Validado**
- 31 de 31 testes; login de liderança (90000 e 91001) pelo formulário; computador 1280 px e celular 390 px sem rolagem lateral; nenhum erro no console.

**Aprendizados**
- No celular, `aspect-ratio` junto com `max-height` fez o navegador calcular uma largura mínima maior que a tela (457 px em 390). Troquei por altura direta e coluna `minmax(0, 1fr)`.
- O cache do navegador voltou a enganar o teste com arquivos `?v=0.7` antigos. Para o time não acontece porque a versão só é publicada uma vez; em desenvolvimento, forçar a atualização dos arquivos antes de conferir.

## 02/10/2026: v0.6, duas visões (Liderança e Colaborador)

**Decisão:** supervisor, coordenador e gerente viam as mesmas telas; a diferença era só quantos CDDs cada um acompanha. Viraram uma visão só, **Liderança**, e o cargo passou a ser apenas um rótulo.

**Feito**
- Todos os líderes em `dados/geral.js` com `cargo` e `unidades` (lista ou `"todas"`); o campo `supervisor` saiu dos arquivos dos CDDs.
- "Visão geral" e seletor de unidade aparecem sozinhos para quem acompanha mais de um CDD.
- Cartão do CDD mostra a "liderança local" (quem acompanha só aquele CDD).
- Login com os acessos de demonstração agrupados em Liderança e Colaborador.
- **Versão nos endereços dos arquivos** (`?v=0.6`): durante o teste, o navegador usou um CSS antigo do cache. O mesmo aconteceria com o time depois de cada publicação.

**Validado**
- 31 de 31 testes (2 novos: cargo como rótulo e liderança local; validação de líder sem CDD ou com CDD inexistente).
- Supervisora (1 CDD) entra sem "Visão geral" e sem seletor; coordenador SP/ES vê só Mauá e Vitória, com a liderança local de cada um.
- Nenhum erro no console.

## 02/10/2026: v0.5, cadastro (Etapa 1 do plano de absenteísmo)

**Pedido:** cadastro do time e da escala, tipo de jornada por CDD, e base para a análise de absenteísmo com AFDT (próximas etapas).

**Feito**
- Tela **Cadastro** para a liderança: tipo de jornada e cobertura mínima do CDD; equipe com PIS/CPF, admissão e desligamento; escala de cada pessoa conforme o tipo; ocorrências (férias, atestado, afastamento, falta).
- **Repositório** com transação: alteração inválida é desfeita e os erros aparecem no formulário. Dados salvos no navegador, com exportar, importar e restaurar exemplo.
- **Quadro ativo:** desligar não apaga a pessoa nem o histórico; contratado novo não precisa de escala antes da admissão.
- **Perfis:** supervisor (1 CDD), coordenador (grupo de CDDs) e gerente (todos), no lugar do "gestor".
- Novas situações: falta (só em dia de trabalho), afastamento e fora do quadro.
- Dados de exemplo com PIS fictícios válidos, histórico de faltas de jul a set/2026 e meses de jul e ago nas escalas mensais.
- `.gitignore` bloqueando arquivos de ponto reais.

**Validado**
- 29 de 29 testes passando, incluindo os 9 novos de cadastro, PIS/CPF e perfis.
- Na tela: PIS inválido mostra erro sem fechar o formulário; cadastro válido aparece na lista e continua lá depois de recarregar a página; falta salva em dia de trabalho; coordenadora PR vê só Paranaguá e Curitiba; formulário mensal mostra os meses publicados e não deixa marcar 3 dias; formulário no celular sem rolagem lateral.
- Nenhum erro no console.

**Correções nos próprios testes:** `12345678900` é um PIS válido por coincidência (troquei o exemplo de inválido), e o teste de desligamento usava data futura.

## 02/10/2026: v0.4, 4 CDDs com 3 tipos de escala

**Pedido:** Mauá com escala rotativa (muda toda semana), Vitória com escala fixa e Paranaguá e Curitiba com escala mensal.

**Feito**
- Regras separadas por tipo em `js/core/regras/` (padrão Strategy): fixa, rotativa (folgas andam 1 dia por semana, ciclo de 7) e mensal (publicada por mês, com estado "a publicar").
- Dados separados: `dados/geral.js` e um arquivo por CDD em `dados/unidades/`, 6 pessoas fictícias em cada.
- Perfis: colaborador, supervisor (só a sua unidade) e gestor regional (as 4, com seletor de unidade).
- Nova tela **Visão geral** para o gestor e faixa com nome do CDD e tipo de escala em todas as telas.
- Novo alerta "sem domingo de folga nas próximas 8 semanas"; a cobertura passou a reconhecer dias a publicar.
- Testes reescritos: 20 testes agrupados por tipo de escala.
- Ícone da aba do navegador (resolvia um erro 404 de favicon).

**Validado**
- 20 de 20 testes passando; validação acusa erro ao estragar dados de propósito (testado e revertido).
- Login dos 5 acessos de demonstração e perfis corretos.
- Visão geral com os 4 CDDs; seletor de unidade; cobertura de Vitória lista os 4 sem domingo de folga.
- Paranaguá em novembro aparece "a publicar" na semana, no calendário e na visão geral.
- Rotativa: Carlos folga Qui+Sex nesta semana e Sex+Sáb na próxima.
- Celular (390 px) sem rolagem lateral; nenhum erro no console.

**Observação para a apresentação**
- Com 3 pessoas por função, qualquer férias deixa a unidade abaixo do mínimo (Mauá tem 10 dias de alerta em 28 por causa de 1 férias). É um bom ponto para discutir dimensionamento de equipe.
- Na mensal com a mesma folga o mês inteiro, sempre sobra alguém sem domingo por 2 meses (o alerta aparece em Curitiba). Validar com os CDDs se a escala mensal real varia semana a semana.

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

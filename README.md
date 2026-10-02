# Consulta de Escala 5x2

Protótipo de um site para as equipes de entrega consultarem a escala 5x2 (5 dias de trabalho e 2 de folga por semana) em **4 CDDs com 3 tipos de escala**.

Projeto acadêmico do MBL, voltado para a operação Ambev. **Todos os nomes e dados são fictícios.**

## Como abrir

**Online (para o time testar):** https://luizfelipehx.github.io/escala-5x2/

Funciona no celular e no computador. Testes automáticos: https://luizfelipehx.github.io/escala-5x2/testes.html

**No computador, sem internet:** baixe a pasta e dê dois cliques em `index.html` (Chrome ou Edge).

> O site publicado é público e usa **apenas dados fictícios**. Não cadastre nomes ou dados reais nesta versão: para isso é preciso login de verdade (Fase 2 em `docs/ROADMAP.md`).

## Unidades e tipos de escala

| CDD | Tipo | Como funciona |
|---|---|---|
| Mauá (SP) | **Rotativa** | As 2 folgas são dias seguidos e avançam 1 dia por semana (Seg+Ter, Ter+Qua, ...). Ciclo de 7 semanas. |
| Vitória (ES) | **Fixa** | As folgas são sempre nos mesmos dias. Só mudam quando entra alguém novo. |
| Paranaguá (PR) | **Mensal** | A supervisão publica as folgas de cada mês. Mês não publicado aparece como "a publicar". |
| Curitiba (PR) | **Mensal** | Igual a Paranaguá. |

## Acessos de demonstração

A senha de todos é **1234**. Na tela de login também dá para clicar direto num dos acessos.

| Perfil | Matrícula | Vê |
|---|---|---|
| Gestora regional | 90000 | Os 4 CDDs, com visão geral consolidada |
| Supervisor(a) | 91001 Mauá, 92001 Vitória, 93001 Paranaguá, 94001 Curitiba | Só a própria unidade |
| Colaborador | 10001 a 10006 Mauá, 20001 a 20006 Vitória, 30001 a 30006 Paranaguá, 40001 a 40006 Curitiba | Só a própria escala |

> O login é **simulado**, só para mostrar o fluxo. Ele não protege os dados.

## O que cada perfil vê

**Colaborador:** se trabalha ou folga hoje, a próxima folga, o próximo domingo de folga, como está o parceiro de rota e o calendário do mês. O quadro de regra explica a escala dele (ex.: "Folgas nesta semana: Quinta e Sexta. Na próxima: Sexta e Sábado").

**Supervisor:**
- **Hoje:** quem está em operação e quem está fora, com alerta se faltar gente.
- **Semana:** grade da equipe de segunda a domingo, com o total por função.
- **Cobertura:** 28 dias à frente, dias abaixo do mínimo, dias a publicar, quem folga nos próximos domingos e alerta de quem está sem domingo de folga.
- **Escala individual:** o calendário de qualquer colaborador. Também abre ao clicar no nome.

**Gestor:** tudo do supervisor para qualquer CDD (seletor de unidade no topo), mais a **Visão geral**: um cartão por CDD com operação de hoje, alertas de cobertura, pessoas sem domingo de folga e se a escala do próximo mês já foi publicada.

## Como alterar os dados

Os dados ficam na pasta `dados/`:

- `dados/geral.js`: senha de demonstração, gestores e feriados.
- `dados/unidades/<cdd>.js`: um arquivo por CDD, com equipe, ausências e as regras daquele tipo de escala. Cada arquivo explica no topo como preencher.

Depois de editar, abra `testes.html` para conferir as regras. Se algo estiver errado nos dados, o próprio site mostra um aviso vermelho dizendo o CDD e a pessoa.

## Estrutura

```
index.html              página do site
testes.html             testes automáticos das regras (20 testes)
dados/geral.js          dados comuns
dados/unidades/         um arquivo por CDD
css/                    estilos (base, componentes, telas)
js/core/datas.js        utilitários de data
js/core/regras/         uma regra por tipo de escala (fixa, rotativa, mensal)
js/core/escala.js       regras comuns: ausências, cobertura, alertas
js/core/sessao.js       login simulado
js/ui/                  peças de interface reaproveitadas
js/telas/               uma tela por arquivo
js/app.js               estado, navegação e cliques
docs/                   documentação técnica
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md): como o código está organizado e por quê.
- [Módulos](docs/MODULES.md): o que cada arquivo faz.
- [Roadmap](docs/ROADMAP.md): próximas fases.
- [TODO](docs/TODO.md): pendências.
- [Devlog](docs/DEVLOG.md): histórico das mudanças.

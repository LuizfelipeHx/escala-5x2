# Consulta de Escala 5x2

Protótipo de um site para a equipe de entrega consultar a escala 5x2 (5 dias de trabalho e 2 de folga por semana, com rodízio de domingo).

Projeto acadêmico do MBL, voltado para a operação Ambev. **Todos os nomes e dados são fictícios.**

## Como abrir

**Online (para o time testar):** https://luizfelipehx.github.io/escala-5x2/

Funciona no celular e no computador. Testes automáticos: https://luizfelipehx.github.io/escala-5x2/testes.html

**No computador, sem internet:**
1. Baixe ou descompacte a pasta.
2. Dê dois cliques em `index.html`. O site abre no navegador (Chrome ou Edge).

> O site publicado é público e usa **apenas dados fictícios**. Não cadastre nomes ou dados reais nesta versão: para isso é preciso login de verdade (Fase 2 em `docs/ROADMAP.md`).

## Acessos de demonstração

A senha de todos é **1234**. Na tela de login também dá para clicar direto num dos acessos.

| Perfil | Matrícula | Nome |
|---|---|---|
| Motorista | 10001 | Carlos Mendes |
| Ajudante | 10006 | Marcos Oliveira |
| Supervisora | 90001 | Patrícia Nogueira |

Qualquer matrícula de 10001 a 10010 entra como colaborador.

> O login é **simulado**, só para mostrar o fluxo. Ele não protege os dados. Na versão final, o acesso será validado por um servidor (ver `docs/ROADMAP.md`).

## O que cada perfil vê

**Colaborador (motorista ou ajudante)**
- Se trabalha ou folga hoje, e quando é a próxima folga ou o retorno.
- Próximo domingo de folga e situação do parceiro de rota.
- Calendário do mês com trabalho, folga, férias, atestado e feriados.

**Supervisor**
- **Hoje:** quem está em operação e quem está fora, com alerta se faltar gente.
- **Semana:** grade de segunda a domingo da equipe toda, com o total por função.
- **Cobertura:** 28 dias à frente, dias abaixo do mínimo e o rodízio de domingo.
- **Escala individual:** o calendário de qualquer colaborador. Também abre ao clicar no nome da pessoa.

## Regra da escala

- Cada pessoa tem uma **folga fixa** (de segunda a sábado).
- A equipe é dividida em **grupos de domingo** (A, B, C). A cada semana, um grupo folga no domingo.
- Na semana do seu grupo, a pessoa folga: folga fixa + domingo.
- Nas outras semanas: folga fixa + **folga extra**.

Assim todos sempre trabalham 5 dias e folgam 2, com 1 domingo de folga a cada 3 semanas.

## Como alterar os dados

Edite só o arquivo `dados/equipe.js`. Ele tem a equipe, as folgas, as férias e atestados, os feriados e a cobertura mínima por função. Depois de editar:

1. Abra `testes.html` para conferir se a escala continua válida (5x2 em todas as semanas, domingos, cobertura).
2. Recarregue o `index.html`.

Se algo estiver errado no arquivo (matrícula repetida, folga no mesmo dia etc.), o próprio site mostra um aviso vermelho.

## Estrutura

```
index.html        página do site
testes.html       testes automáticos das regras
dados/equipe.js   dados fictícios (único arquivo a editar)
css/              estilos (base, componentes, telas)
js/core/          regras: datas, escala e login simulado
js/ui/            peças de interface reaproveitadas
js/telas/         uma tela por arquivo
js/app.js         estado, navegação e cliques
docs/             documentação técnica
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md): como o código está organizado e por quê.
- [Módulos](docs/MODULES.md): o que cada arquivo faz.
- [Roadmap](docs/ROADMAP.md): próximas fases, do esboço à versão real.
- [TODO](docs/TODO.md): pendências.
- [Devlog](docs/DEVLOG.md): histórico das mudanças.

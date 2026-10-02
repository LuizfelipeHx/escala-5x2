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
| Gerente regional | 90000 | Os 4 CDDs |
| Coordenador(a) | 80001 (Mauá e Vitória), 80002 (Paranaguá e Curitiba) | O seu grupo de CDDs |
| Supervisor(a) | 91001 Mauá, 92001 Vitória, 93001 Paranaguá, 94001 Curitiba | Só a própria unidade |
| Colaborador | 10001 a 10006 Mauá, 20001 a 20006 Vitória, 30001 a 30006 Paranaguá, 40001 a 40006 Curitiba | Só a própria escala |

> O login é **simulado**, só para mostrar o fluxo. Ele não protege os dados.

## O que cada perfil vê

**Colaborador:** se trabalha ou folga hoje, a próxima folga, o próximo domingo de folga, como está o parceiro de rota e o calendário do mês.

**Liderança (supervisor, coordenador e gerente):**
- **Visão geral** (coordenador e gerente): um cartão por CDD com operação de hoje, alertas de cobertura, pessoas sem domingo de folga e publicação da escala do próximo mês.
- **Hoje:** quem está em operação e quem está fora, com alerta se faltar gente.
- **Semana:** grade da equipe de segunda a domingo, com o total por função.
- **Cobertura:** 28 dias à frente, dias abaixo do mínimo, dias a publicar e quem folga nos próximos domingos.
- **Escala individual:** o calendário de qualquer colaborador. Também abre ao clicar no nome.
- **Cadastro:** tipo de jornada do CDD, equipe (com PIS/CPF, admissão e desligamento), escala de cada pessoa e ocorrências.

## Cadastro

- **Tipo de jornada do CDD:** fixa, rotativa ou mensal, e a cobertura mínima por função. É o que separa folga de falta nas análises.
- **Equipe:** incluir, editar, desligar (mantém o histórico) ou excluir (só para cadastro errado). O PIS/CPF é validado pelo dígito verificador e serve para cruzar com o arquivo de ponto (AFDT).
- **Ocorrências:** férias, atestado, afastamento e falta injustificada. **Só a falta conta como absenteísmo.** Falta só pode ser lançada em dia de trabalho da escala.

> **Onde fica salvo:** nesta versão, o que você cadastra fica **só no seu navegador**. Quem abrir o site em outro aparelho vê os dados de exemplo. Use "Exportar dados" e "Importar dados" para levar o cadastro de um navegador para outro, e "Restaurar dados de exemplo" para recomeçar.

> **Dados reais:** o site está publicado num endereço público. Não cadastre pessoas reais nem coloque arquivos de ponto reais na pasta do projeto: o `.gitignore` bloqueia arquivos `.txt`, `.afd` e `.afdt` fora da pasta `exemplos/`.

## Como alterar os dados de exemplo

Os dados de exemplo ficam na pasta `dados/`:

- `dados/geral.js`: senha de demonstração, coordenação, gerência e feriados.
- `dados/unidades/<cdd>.js`: um arquivo por CDD, com equipe, ocorrências e as regras daquele tipo de escala. Cada arquivo explica no topo como preencher.

Depois de editar, abra `testes.html` para conferir as regras. Se algo estiver errado nos dados, o próprio site mostra um aviso vermelho dizendo o CDD e a pessoa.

## Estrutura

```
index.html              página do site
testes.html             testes automáticos (29 testes)
dados/geral.js          dados comuns de exemplo
dados/unidades/         um arquivo de exemplo por CDD
css/                    estilos (base, componentes, telas)
js/core/datas.js        utilitários de data
js/core/documentos.js   validação de PIS e CPF
js/core/regras/         uma regra por tipo de escala (fixa, rotativa, mensal)
js/core/escala.js       regras comuns: quadro ativo, ausências, cobertura, alertas
js/core/repositorio.js  leitura e gravação dos dados (hoje: navegador)
js/core/sessao.js       login simulado e perfis
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

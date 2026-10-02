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

O site tem **duas visões**: **Liderança** e **Colaborador**. Na liderança, todos veem as mesmas telas; o que muda é quais CDDs cada pessoa acompanha. O cargo é só um rótulo.

| Visão | Matrícula | Cargo | CDDs que acompanha |
|---|---|---|---|
| Liderança | 90000 | Gerente regional | Os 4 |
| Liderança | 80001 / 80002 | Coordenação | Mauá e Vitória / Paranaguá e Curitiba |
| Liderança | 91001 / 92001 / 93001 / 94001 | Supervisão | Mauá / Vitória / Paranaguá / Curitiba |
| Colaborador | 10001 a 10006 Mauá, 20001 a 20006 Vitória, 30001 a 30006 Paranaguá, 40001 a 40006 Curitiba | Motorista ou ajudante | Só a própria escala |

> O login é **simulado**, só para mostrar o fluxo. Ele não protege os dados. A tela de login não lista os acessos (para ter a aparência da versão final): repasse ao time os acessos desta tabela.

> **Imagem do login:** foto da marca Corona, usada a pedido do time Ambev, para quem o projeto é feito. Uso interno do protótipo; não reutilizar fora dele.

## O que cada visão mostra

**Colaborador:** se trabalha ou folga hoje, a próxima folga, o próximo domingo de folga, como está o parceiro de rota e o calendário do mês.

**Liderança:**
- **Visão geral** (quando acompanha mais de um CDD): um cartão por CDD com operação de hoje, alertas de cobertura, pessoas sem domingo de folga e publicação da escala do próximo mês.
- **Hoje:** quem está em operação e quem está fora, com alerta se faltar gente.
- **Semana:** grade da equipe de segunda a domingo, com o total por função.
- **Cobertura:** 28 dias à frente, dias abaixo do mínimo, dias a publicar e quem folga nos próximos domingos.
- **Absenteísmo › Histórico:** faltas e % de absenteísmo por dia da semana, por semana do mês e mês a mês, com comparação contra o mês anterior e o mesmo mês do ano anterior. Mostra também atestados e falhas de registro, que não contam como falta.
- **Absenteísmo › Calendário de risco:** cada dia do mês em Normal, Atenção ou Alta atenção, com o histórico que sustenta a estimativa ao clicar no dia.
- **Absenteísmo › Por colaborador:** quem continua no CDD e já estava na operação no período, com faltas, %, episódios, fator de Bradford e padrões de recorrência. Filtros por dia da semana e mês respondem "quem falta às segundas?" ou "quem falta em novembro?". Ao clicar na pessoa: faltas mês a mês, por dia da semana e as datas de cada falta.
- **Escala individual:** o calendário de qualquer colaborador. Também abre ao clicar no nome.
- **Cadastro:** tipo de jornada do CDD, equipe (com PIS/CPF, admissão e desligamento), escala de cada pessoa e ocorrências.

## Cadastro

- **Tipo de jornada do CDD:** fixa, rotativa ou mensal, e a cobertura mínima por função. É o que separa folga de falta nas análises.
- **Equipe:** incluir, editar, desligar (mantém o histórico) ou excluir (só para cadastro errado). O PIS/CPF é validado pelo dígito verificador e serve para cruzar com o arquivo de ponto (AFDT).
- **Ocorrências:** férias, atestado, afastamento e falta injustificada. **Só a falta conta como absenteísmo.** Falta só pode ser lançada em dia de trabalho da escala.

> **Onde fica salvo:** nesta versão, o que você cadastra fica **só no seu navegador**. Quem abrir o site em outro aparelho vê os dados de exemplo. Use "Exportar dados" e "Importar dados" para levar o cadastro de um navegador para outro, e "Restaurar dados de exemplo" para recomeçar.

> **Dados reais:** o site está publicado num endereço público. Não cadastre pessoas reais nem coloque arquivos de ponto reais na pasta do projeto: o `.gitignore` bloqueia arquivos `.txt`, `.afd` e `.afdt` fora da pasta `exemplos/`.

## Absenteísmo (histórico fictício)

Enquanto o arquivo de ponto (AFDT) não é importado, o site **gera um histórico fictício** de jul/2024 a set/2026, sempre igual, a partir de `dados/historico-ficticio.js`. Ele só cria ocorrência em dia em que a pessoa estava escalada e tem padrões de propósito (mais faltas às segundas, em novembro e dezembro, e cinco reincidentes: Thiago e Caio às segundas, Paulo e Ricardo às sextas, Igor em novembro).

- **Absenteísmo** = faltas injustificadas ÷ pessoas-dia previstas. Folga, férias e afastamento não entram na conta.
- **Risco de um dia** = média ponderada de 3 sinais: o mesmo dia da semana nos últimos 3 meses (40%), a mesma semana do mês (30%) e o mesmo dia da semana no mesmo mês do ano anterior (30%). Comparado à média da unidade: **Atenção** a partir de 15% acima, **Alta atenção** a partir de 40% acima. Sinal com menos de 15 pessoas-dia previstas é ignorado; sem nenhum, o dia fica "Sem dados".
- **Sinal por colaborador** (últimos 90 dias) = o pior entre: absenteísmo da pessoa comparado com o da equipe (atenção a partir de 1,5×, alta a partir de 2×, com pelo menos 3 faltas) e o fator de Bradford (episódios² × dias; atenção a partir de 50, alta a partir de 125). Menos de 40 dias previstos no período: "poucos dados".
- **Padrão de recorrência** (dia da semana ou mês) só aparece se a pessoa faltar pelo menos o dobro do **restante da equipe** no mesmo recorte e a chance de ser acaso (teste binomial) ficar abaixo de 0,5%. Num mês, também precisa ter faltas em pelo menos 2 anos.
- É um **sinal para planejamento e acompanhamento**, não uma previsão de quem vai faltar. Só a liderança vê.

## Como alterar os dados de exemplo

Os dados de exemplo ficam na pasta `dados/`:

- `dados/geral.js`: senha de demonstração, liderança (cargo e CDDs que acompanha) e feriados.
- `dados/unidades/<cdd>.js`: um arquivo por CDD, com equipe, ocorrências e as regras daquele tipo de escala. Cada arquivo explica no topo como preencher.

Depois de editar, abra `testes.html` para conferir as regras. Se algo estiver errado nos dados, o próprio site mostra um aviso vermelho dizendo o CDD e a pessoa.

## Estrutura

```
index.html              página do site
testes.html             testes automáticos (49 testes)
dados/geral.js          dados comuns de exemplo
dados/unidades/         um arquivo de exemplo por CDD
dados/historico-ficticio.js  parâmetros do histórico de ponto fictício
css/                    estilos (base, componentes, telas)
img/                    foto do login e ícone da aba
js/core/datas.js        utilitários de data
js/core/documentos.js   validação de PIS e CPF
js/core/regras/         uma regra por tipo de escala (fixa, rotativa, mensal)
js/core/escala.js       regras comuns: quadro ativo, ausências, cobertura, alertas
js/core/historico.js    histórico de ponto, análises de absenteísmo e risco por dia
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

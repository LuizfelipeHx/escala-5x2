# TODO

## Próximo passo

- [x] **Item 4:** cruzamento do histórico por funcionário (v0.10)
- [ ] Validar com o RH as faixas do sinal por pessoa (1,5× e 2× a equipe; Bradford 50 e 125) e o uso do fator de Bradford
- [ ] Decidir se o calendário de risco destaca os dias **dentro do mês** (hoje compara com a média dos 12 meses; em mês de pico quase todos os dias ficam destacados, como novembro em Curitiba)
- [ ] Importação do AFDT real

## Antes da apresentação

- [ ] Revisar os nomes fictícios dos 4 CDDs em `dados/unidades/`
- [ ] Testar no navegador e no celular usados na apresentação
- [x] Identidade visual do login (foto cedida pelo time Ambev, marca tipográfica)

## Pendências de negócio

- [ ] Conseguir um AFDT real (2 ou 3 pessoas basta) para validar o layout dos relógios
- [ ] Mauá: confirmar se a rotativa real é "anda 1 dia por semana"
- [ ] Paranaguá e Curitiba: a mensal real tem a mesma folga o mês todo ou varia por semana?
- [ ] Vitória: 4 de 6 pessoas nunca folgam no domingo; validar com o RH
- [ ] Faixas do semáforo de risco (sugestão inicial: verde < 3%, amarelo 3 a 5%, vermelho > 5%)
- [ ] Quantidade real das equipes e cobertura mínima real por CDD

## Pendências técnicas

- [ ] Histórico de jornada do CDD (hoje vale o tipo atual para todo o passado, inclusive na análise de absenteísmo)
- [ ] Visão consolidada de absenteísmo de vários CDDs para coordenação e gerência (hoje é um CDD por vez)
- [ ] Escala mensal com folgas diferentes por semana dentro do mês (se a operação usar)
- [ ] Testes de interface (hoje os testes cobrem regras e cadastro)
- [ ] Permitir mais de um parceiro de rota

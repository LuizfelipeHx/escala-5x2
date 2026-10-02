# Roadmap

## Fase 0: Esboço (feito)

- [x] Consulta de escala com dados fictícios, publicada no GitHub Pages
- [x] 4 CDDs com 3 tipos de escala (rotativa, fixa, mensal)
- [x] Login simulado com duas visões (Liderança e Colaborador)
- [x] Férias, atestados e feriados; alerta de cobertura e de domingo
- [x] Testes automáticos das regras

## Fase 1: Absenteísmo (em andamento)

Pedido do MBL (02/10/2026), entregue por etapas com aprovação entre elas.

| Item do pedido | Entrega | Situação |
|---|---|---|
| 1. Tipo de jornada por CDD | Cadastro do CDD, equipe com PIS/CPF, escala por pessoa, ocorrências | ✅ v0.5 e v0.6 |
| 2. Análise histórica | Dia da semana, semana do mês, meses anteriores, mesmo mês do ano anterior, faltas e % sobre os previstos | ✅ v0.9 (histórico fictício) |
| 3. Calendário de risco | Dias em Normal/Atenção/Alta atenção com o histórico que sustenta cada um | ✅ v0.9 |
| 4. Cruzamento por funcionário | Recorrência por pessoa (dia da semana, mês), períodos e quantidade de dados, como sinal para acompanhamento | ✅ v0.10 |
| 5. Distinguir falta de folga, férias, afastamento e falha de registro | Cadastro e apuração já separam; a falha de registro real depende do AFDT | 🟡 parcial |
| Importação do AFDT | Ler arquivos de ponto (layout oficial, PIS ou CPF) e substituir o histórico fictício | ⏳ |
| Visual | Ícones, barra inferior no celular, mini gráficos, modo escuro e transições | ⏳ |

Regras já decididas:
- Só falta injustificada conta como absenteísmo. Atestado e falha de registro aparecem, mas não contam.
- Risco por pessoa (item 4) = % de ausência + fator de Bradford, sempre como sinal para acompanhamento.
- Dias sem escala conhecida ficam fora das contas.
- AFDT é lido só no navegador; arquivo real nunca vai para o repositório.

## Fase 2: Piloto

- Validar o leitor de AFDT com um arquivo real dos relógios dos CDDs
- Banco de dados compartilhado (ex.: Supabase) e login real por matrícula
- Supervisor montando e publicando a escala mensal pelo site
- Instalar no celular como aplicativo (PWA)

## Fase 3: Produção

- Integração automática com o sistema de ponto e de RH
- Pedido de troca de folga com aprovação
- Avisos de próxima folga e de mudança de escala
- Auditoria de alterações e adequação completa à LGPD

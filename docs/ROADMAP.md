# Roadmap

## Fase 0: Esboço (atual)

- [x] Consulta de escala com dados fictícios, abrindo por duplo clique
- [x] Login simulado com perfis colaborador e supervisor
- [x] Regra 5x2 com rodízio de domingo
- [x] Férias, atestados e feriados
- [x] Alerta de cobertura mínima por função
- [x] Testes automáticos das regras
- [x] Publicado no GitHub Pages para o time testar (dados fictícios)
- [x] 4 CDDs com 3 tipos de escala (rotativa, fixa, mensal) e visão do gestor
- [ ] Apresentação para o time Ambev

## Fase 1: Validação com a operação

- Confirmar a regra real de folga e o rodízio de domingo com o RH e o jurídico
- Definir a quantidade real da equipe e a cobertura mínima por função e por dia
- Decidir se a cobertura muda por dia da semana (ex.: sábado com menos rotas)
- Coletar opinião de motoristas e ajudantes sobre o que mais consultam

## Fase 2: Piloto

- Publicar o site (ex.: GitHub Pages ou hospedagem da empresa)
- Login real por matrícula e PIN (ex.: Firebase ou Supabase) ou pela conta corporativa
- Supervisor editando a escala e as ausências pelo próprio site (na mensal: montar e publicar o mês)
- Instalar no celular como aplicativo (PWA) e funcionar sem internet
- Exportar a escala do mês em PDF para o mural

## Fase 3: Produção

- Integração com o sistema de RH/ponto (férias e atestados automáticos)
- Pedido de troca de folga com aprovação do supervisor
- Aviso da próxima folga e de mudanças na escala (notificação ou WhatsApp)
- Registro de quem alterou o quê (auditoria)
- Adequação à LGPD: cada colaborador vê só os próprios dados e os do parceiro de rota

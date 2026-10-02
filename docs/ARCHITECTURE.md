# Arquitetura

## Objetivo das decisões

O protótipo precisa funcionar **publicado no GitHub Pages e também aberto por dois cliques**, sem instalação. E precisa atender CDDs com **tipos de escala diferentes** sem que cada tipo vire um site separado.

## Decisões principais

| Decisão | Motivo | Custo aceito |
|---|---|---|
| HTML, CSS e JavaScript puros, sem framework | Nada para instalar, abre em qualquer navegador, fácil de explicar | Mais código manual de interface |
| Sem etapa de build | O que está no repositório já é o site final | Sem TypeScript nem minificação |
| Scripts clássicos com um único objeto global `window.Escala` | Navegadores bloqueiam módulos ES (`import`) em arquivos abertos por `file://` | A ordem dos `<script>` no `index.html` importa |
| Dados em arquivos `.js`, não `.json` | `fetch` de arquivo local também é bloqueado em `file://` | Cada arquivo de dados tem uma linha de código |
| **Uma regra por tipo de escala (padrão Strategy)** | Cada CDD pode ter um tipo diferente sem `if` espalhado pelas telas | Um contrato a respeitar (ver abaixo) |
| Um arquivo de dados por CDD | Cada supervisão mexe só no seu arquivo; menos conflito | Um `<script>` a mais por unidade |
| Login simulado em `sessionStorage` | É um esboço; segurança real exige servidor | Não protege nada (avisado na tela) |
| **Repositório** como única porta para alterar dados, salvando no `localStorage` | Cadastro funciona sem servidor; trocar por banco de dados depois mexe em um arquivo só | Cada navegador tem os seus dados (avisado na tela) |
| Desligar = data de desligamento, não apagar | Preserva o histórico de faltas para as análises | Telas filtram quem está "no quadro" em cada dia |

> **Para aprender:** *Strategy* é quando várias formas de fazer a mesma coisa seguem o mesmo "formato de tomada". Aqui, fixa, rotativa e mensal respondem à mesma pergunta ("esta pessoa trabalha neste dia?"). O resto do sistema só faz a pergunta, sem saber qual regra respondeu. Um tipo novo, como 12x36, é só um arquivo novo.

## Camadas

```
dados/geral.js + dados/unidades/*     DADOS
            │
js/core/datas.js                      utilitários de data
js/core/regras/*                      uma regra por tipo de escala
js/core/documentos.js                 validação de PIS e CPF
js/core/escala.js                     quadro ativo, ausências, cobertura, alertas (comum a todos)
js/core/repositorio.js                carregar, alterar (com transação), exportar e importar
js/core/sessao.js                     login simulado e perfis
            │
js/ui/*                               peças de HTML reaproveitadas
            │
js/telas/*                            uma tela por arquivo, só montam HTML
            │
js/app.js                             estado, navegação e eventos
```

Regra de dependência: cada camada só usa as de cima. O núcleo (`js/core/`) não toca na tela, então pode ser reaproveitado numa versão com servidor sem alteração.

## Contrato das regras de escala

Cada arquivo em `js/core/regras/` registra `Escala.regras[tipo]` com:

| Membro | O que faz |
|---|---|
| `nome`, `resumo` | Textos exibidos no site |
| `situacao(pessoa, dia, unidade)` | `"trabalho"`, `"folga"` ou `"pendente"` (escala a publicar) |
| `descrever(pessoa, unidade, { hoje, mes })` | Frases que explicam a escala da pessoa |
| `validar(unidade)` | Lista de problemas nos dados daquele tipo |
| `publicacao(unidade, mes)` | Opcional, só na mensal: se o mês foi publicado e quando |

### Os três tipos

- **Fixa:** `pessoa.folgas` com 2 dias da semana, iguais em todas as semanas.
- **Rotativa:** a semana do ciclo é contada a partir de `unidade.inicioCiclo`. O par de folgas é `(posicaoInicial + semana) mod 7`, onde 0 é Seg+Ter e 6 é Seg+Dom. A cada semana o par anda 1 dia.
- **Mensal:** `unidade.meses["AAAA-MM"]` tem `publicadaEm` e as folgas de cada matrícula no mês. Dia de mês não publicado é `"pendente"`.

## Situação de uma pessoa num dia

1. **Fora do quadro** (`inativo`) se o dia é antes da admissão ou depois do desligamento.
2. **Ocorrência** lançada para a data: férias, atestado, afastamento (justificadas) ou falta (injustificada).
3. Senão, a **regra da unidade** decide entre trabalho, folga ou pendente.

Só a **falta** é absenteísmo. Uma falta só pode ser lançada em dia de trabalho da escala, o que impede contar folga como falta.

## Repositório e transação

Toda alteração passa por `js/core/repositorio.js`, dentro de uma **transação**:

1. Guarda uma cópia dos dados.
2. Aplica a alteração.
3. Roda `escala.validarDados()`.
4. Se aparecer qualquer erro, volta à cópia e devolve os erros para o formulário. Se não, grava no `localStorage`.

Assim os dados nunca ficam num estado inválido. Na carga, se o que está salvo no navegador estiver corrompido ou inválido, o site volta para os dados de exemplo e avisa.

> **Para aprender:** transação é o "tudo ou nada" dos bancos de dados. Ou a alteração inteira entra, ou nada muda.

## Perfis

| Perfil | Unidades visíveis | Origem |
|---|---|---|
| colaborador | a sua (só a própria escala) | `equipe` de cada CDD |
| supervisor | o seu CDD | `supervisor` de cada CDD |
| coordenador | o grupo em `liderancas[].unidades` | `dados/geral.js` |
| gerente | todas | `dados/geral.js` |

A sessão é relida a cada carga: quem foi desligado ou excluído é deslogado.

A semana vai de segunda a domingo. Contas de dias usam UTC para não sofrer com fuso horário.

## Fluxo de desenho

1. `app.js` lê a sessão. Sem usuário, desenha o login.
2. Com usuário, monta a moldura uma vez (`ui/layout.js`) e escolhe a unidade: a do usuário, ou a primeira para o gestor.
3. A cada ação, redesenha só a faixa da unidade e o `#conteudo`. A moldura fixa evita que a busca perca o foco ao digitar.

Eventos usam **delegação**: um único ouvinte no `document` lê `data-acao`, `data-aba`, `data-id` e `data-unidade`. As telas não registram eventos.

## Alertas

- **Cobertura:** por unidade e por função, comparando quem está em operação com `coberturaMinima`.
- **Sem domingo de folga:** quem não folga nenhum domingo nas próximas 8 semanas (só conta dias já publicados). Serve de alerta para validar a regra de revezamento com o RH.

## Segurança (escopo do protótipo)

- Todo texto vindo dos dados passa por `ui.esc()` antes de virar HTML.
- Páginas com `noindex` para não aparecerem em buscadores.
- O login não é seguro e não pretende ser. Na versão real, `js/core/sessao.js` é trocado por autenticação num servidor, e os dados deixam de ficar no navegador.

## Como evoluir para a versão real

- Trocar `dados/` por chamadas a uma API.
- Trocar `js/core/sessao.js` por autenticação real.
- Manter `js/core/regras/` e `js/core/escala.js` e reaproveitar telas e componentes.

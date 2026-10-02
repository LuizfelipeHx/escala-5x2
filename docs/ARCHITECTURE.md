# Arquitetura

## Objetivo das decisões

O protótipo precisa abrir **com dois cliques, a partir de um zip**, em qualquer computador da equipe. Isso definiu as escolhas abaixo.

## Decisões principais

| Decisão | Motivo | Custo aceito |
|---|---|---|
| HTML, CSS e JavaScript puros, sem framework | Nada para instalar, abre em qualquer navegador, fácil de explicar na apresentação | Mais código manual de interface |
| Sem etapa de build (sem npm, Vite etc.) | O zip enviado já é o site final | Sem TypeScript nem minificação |
| Scripts clássicos com um único objeto global `window.Escala` | Navegadores bloqueiam módulos ES (`import`) em arquivos abertos por `file://` | A ordem dos `<script>` no `index.html` importa |
| Dados num arquivo `.js`, não `.json` | `fetch` de arquivo local também é bloqueado em `file://` | O arquivo de dados tem uma linha de código no topo |
| Login simulado em `sessionStorage` | É um esboço; segurança real exige servidor | Não protege nada (avisado na tela) |

> **Para aprender:** `file://` é como o navegador chama um arquivo aberto do disco. Por segurança, ele trata cada arquivo como uma "origem" separada e bloqueia `import` e `fetch`. Por isso a escolha por scripts clássicos.

## Camadas

```
dados/equipe.js        DADOS     o que muda com frequência (equipe, folgas, ausências)
        │
js/core/*              NÚCLEO    regras puras, sem tocar na tela
        │
js/ui/*                INTERFACE peças de HTML reaproveitadas
        │
js/telas/*             TELAS     uma tela por arquivo, só montam HTML
        │
js/app.js              APP       estado, navegação e eventos
```

Regra de dependência: cada camada só usa as de cima. O núcleo não conhece a tela, então pode ser reaproveitado numa versão com servidor sem alteração.

## Fluxo de desenho

1. `app.js` lê a sessão. Sem usuário, desenha a tela de login.
2. Com usuário, monta a moldura uma vez (`ui/layout.js`): cabeçalho, abas e filtros.
3. A cada ação (clique, filtro, troca de data), só o `#conteudo` é redesenhado pela tela ativa.

Manter a moldura fixa evita que o campo de busca perca o foco enquanto a pessoa digita.

Eventos usam **delegação**: um único ouvinte no `document` lê atributos `data-acao`, `data-aba` e `data-id`. As telas não registram eventos, só devolvem HTML.

## Modelo da escala

A situação de uma pessoa num dia é decidida em ordem de prioridade:

1. **Ausência** (férias ou atestado) cadastrada para a data.
2. **Escala:** o grupo de domingo da semana é calculado a partir de `config.inicioRodizio` (semana 0 = primeiro grupo). Se o grupo da pessoa folga no domingo, as folgas são `folgaFixa + domingo`; senão, `folgaFixa + folgaExtra`.
3. Caso contrário, **trabalho**.

A semana vai de segunda a domingo. Contas de dias usam UTC para não sofrer com fuso horário.

## Segurança (escopo do protótipo)

- Todo texto vindo dos dados passa por `ui.esc()` antes de virar HTML, para evitar injeção de código.
- O login não é seguro e não pretende ser. Na versão real, `js/core/sessao.js` é trocado por autenticação num servidor, e os dados deixam de ficar no navegador.

## Como evoluir para a versão real

- Trocar `dados/equipe.js` por chamadas a uma API.
- Trocar `js/core/sessao.js` por autenticação real.
- Manter `js/core/escala.js` (regras) e reaproveitar telas e componentes.
- Se o projeto crescer muito, migrar a interface para um framework (React, por exemplo). As regras do núcleo continuam valendo.

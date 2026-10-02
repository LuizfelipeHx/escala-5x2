/* Contrato das regras de escala (padrão Strategy).

   Cada tipo de escala é um arquivo nesta pasta que registra em
   Escala.regras[tipo] um objeto com:
     nome, resumo                  textos exibidos no site
     situacao(pessoa, dia, unidade) "trabalho" | "folga" | "pendente"
     descrever(pessoa, unidade, ref) lista de frases sobre a regra da pessoa
                                    (ref = { hoje, mes })
     validar(unidade)               lista de problemas nos dados
     publicacao(unidade, mes)       opcional: { publicada, publicadaEm }

   O resto do sistema só conversa com esse contrato, então um tipo novo
   (ex.: 12x36) é só mais um arquivo aqui. */
(function (E) {
  "use strict";

  E.regras = {};

  E.regrasBase = Object.freeze({
    // Duas folgas válidas: 2 dias diferentes entre 0 (domingo) e 6 (sábado).
    duasFolgasValidas: (dias) =>
      Array.isArray(dias) && dias.length === 2 && dias[0] !== dias[1] &&
      dias.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
  });
})(window.Escala);

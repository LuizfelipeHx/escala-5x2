/* =====================================================================
   HISTÓRICO DE PONTO FICTÍCIO (para demonstrar a análise de absenteísmo)

   Enquanto não importamos o AFDT real, o sistema GERA um histórico de
   ocorrências de ponto a partir destes parâmetros. A geração é
   determinística: sempre dá o mesmo resultado para os mesmos dados.

   Só gera ocorrência em dia em que a pessoa estava ESCALADA para
   trabalhar (folga, férias, afastamento e fora do quadro ficam de fora).

   Padrões colocados de propósito, para a análise ter o que mostrar:
   - mais faltas às segundas e aos sábados;
   - mais faltas na 1ª semana do mês (pós-pagamento) e na 3ª;
   - mais faltas em novembro e dezembro;
   - algumas pessoas com recorrência num dia da semana ou num mês.
   ===================================================================== */

window.Escala = window.Escala || {};

Escala.configHistorico = {
  inicio: "2025-07-01",
  fim: "2026-09-30",
  semente: 2026,

  // Chance, por dia escalado, antes dos fatores abaixo.
  taxaFalta: 0.022,
  taxaAtestado: 0.008,
  taxaFalhaRegistro: 0.012, // batida incompleta: não conta como falta

  fatorUnidade: { maua: 1.25, vitoria: 0.85, paranagua: 1.3, curitiba: 0.8 },
  // Domingo, segunda, terça, quarta, quinta, sexta, sábado
  fatorDiaSemana: [0.7, 1.7, 0.9, 0.8, 1.0, 1.3, 1.4],
  // Semana do mês: 1 = dias 1 a 7, 2 = dias 8 a 14 ... 5 = dias 29 a 31
  fatorSemanaMes: { 1: 1.3, 2: 0.85, 3: 1.2, 4: 0.9, 5: 1.05 },
  // Mês (1 = janeiro). Meses ausentes valem 1.
  fatorMes: { 1: 1.15, 2: 1.1, 7: 1.1, 11: 1.45, 12: 1.5 },

  // Recorrência individual: multiplica a chance num dia da semana ou num mês.
  recorrentes: {
    "10005": { diaSemana: 1, fator: 3 },   // Thiago (Mauá): segundas
    "20005": { diaSemana: 5, fator: 3 },   // Paulo (Vitória): sextas
    "30005": { diaSemana: 1, fator: 3 },   // Caio (Paranaguá): segundas
    "40003": { diaSemana: 5, fator: 2.5 }, // Ricardo (Curitiba): sextas
    "40005": { mes: 11, fator: 3 },        // Igor (Curitiba): novembro
  },
};

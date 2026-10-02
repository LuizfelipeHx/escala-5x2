/* =====================================================================
   DADOS GERAIS DO PROTÓTIPO (FICTÍCIOS)
   Cada CDD tem o seu arquivo em dados/unidades/. Este arquivo guarda o
   que vale para todos: senha de demonstração, gestores e feriados.
   ===================================================================== */

window.Escala = window.Escala || {};

Escala.dados = {
  // Senha única de demonstração (login simulado, sem servidor).
  senhaDemo: "1234",

  // Gestores enxergam todas as unidades.
  gestores: [
    { matricula: "90000", nome: "Patrícia Nogueira", funcao: "Gestora regional" },
  ],

  // Feriados nacionais (informativos: não mudam a escala).
  feriados: [
    { data: "2026-10-12", nome: "Nossa Senhora Aparecida" },
    { data: "2026-11-02", nome: "Finados" },
    { data: "2026-11-15", nome: "Proclamação da República" },
    { data: "2026-11-20", nome: "Dia da Consciência Negra" },
    { data: "2026-12-25", nome: "Natal" },
    { data: "2027-01-01", nome: "Confraternização Universal" },
  ],

  // Preenchido pelos arquivos de dados/unidades/.
  unidades: [],
};

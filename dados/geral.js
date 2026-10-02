/* =====================================================================
   DADOS GERAIS DO PROTÓTIPO (FICTÍCIOS)
   Cada CDD tem o seu arquivo em dados/unidades/. Este arquivo guarda o
   que vale para todos: senha de demonstração, liderança e feriados.
   ===================================================================== */

window.Escala = window.Escala || {};

Escala.dados = {
  // Senha única de demonstração (login simulado, sem servidor).
  senhaDemo: "1234",

  // LIDERANÇA: todos veem as mesmas telas. O que muda é só quais CDDs
  // cada pessoa acompanha ("unidades": lista de ids ou "todas").
  // "cargo" é apenas o texto exibido no site.
  liderancas: [
    { matricula: "90000", nome: "Patrícia Nogueira", cargo: "Gerente regional",  unidades: "todas" },
    { matricula: "80001", nome: "Sérgio Antunes",    cargo: "Coordenador SP/ES", unidades: ["maua", "vitoria"] },
    { matricula: "80002", nome: "Aline Kowalski",    cargo: "Coordenadora PR",   unidades: ["paranagua", "curitiba"] },
    { matricula: "91001", nome: "Renata Alves",      cargo: "Supervisora",       unidades: ["maua"] },
    { matricula: "92001", nome: "Márcio Lopes",      cargo: "Supervisor",        unidades: ["vitoria"] },
    { matricula: "93001", nome: "Juliana Prates",    cargo: "Supervisora",       unidades: ["paranagua"] },
    { matricula: "94001", nome: "Cristiano Reis",    cargo: "Supervisor",        unidades: ["curitiba"] },
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

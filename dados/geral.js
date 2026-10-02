/* =====================================================================
   DADOS GERAIS DO PROTÓTIPO (FICTÍCIOS)
   Cada CDD tem o seu arquivo em dados/unidades/. Este arquivo guarda o
   que vale para todos: senha de demonstração, gestores e feriados.
   ===================================================================== */

window.Escala = window.Escala || {};

Escala.dados = {
  // Senha única de demonstração (login simulado, sem servidor).
  senhaDemo: "1234",

  // Liderança acima do supervisor (o supervisor fica no arquivo de cada CDD).
  // perfil "coordenador": vê as unidades listadas em "unidades".
  // perfil "gerente": vê todas as unidades.
  liderancas: [
    { matricula: "80001", nome: "Sérgio Antunes",    funcao: "Coordenador SP/ES", perfil: "coordenador", unidades: ["maua", "vitoria"] },
    { matricula: "80002", nome: "Aline Kowalski",    funcao: "Coordenadora PR",   perfil: "coordenador", unidades: ["paranagua", "curitiba"] },
    { matricula: "90000", nome: "Patrícia Nogueira", funcao: "Gerente regional",  perfil: "gerente" },
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

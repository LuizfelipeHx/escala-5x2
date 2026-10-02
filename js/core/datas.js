/* Utilitários de data. Sem DOM e sem regra de negócio.
   Todas as datas são "dia puro" (meia-noite local). */
(function (E) {
  "use strict";

  const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const DIAS_LONGO = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const pad = (n) => String(n).padStart(2, "0");
  const soData = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const hoje = () => soData(new Date());
  const addDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const addMeses = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
  const inicioDoMes = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const diasNoMes = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const mesmoDia = (a, b) => a.getTime() === b.getTime();
  const segundaDaSemana = (d) => addDias(d, -((d.getDay() + 6) % 7));

  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const deIso = (s) => {
    const [a, m, d] = s.split("-").map(Number);
    return new Date(a, m - 1, d);
  };

  // Usa UTC para não sofrer com mudança de fuso/horário de verão.
  const diasEntre = (a, b) =>
    Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
                Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);

  const curto = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  const rotulo = (d) => (d ? `${DIAS[d.getDay()]}, ${curto(d)}` : "Sem previsão");
  const extenso = (d) => `${DIAS_LONGO[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()}`;
  const mesAno = (d) => `${MESES[d.getMonth()]} de ${d.getFullYear()}`;

  E.datas = Object.freeze({
    DIAS, DIAS_LONGO, MESES,
    hoje, addDias, addMeses, inicioDoMes, diasNoMes, mesmoDia, segundaDaSemana,
    iso, deIso, diasEntre, curto, rotulo, extenso, mesAno,
  });
})(window.Escala = window.Escala || {});

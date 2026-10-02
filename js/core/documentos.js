/* Validação de documentos usados para casar o cadastro com o AFDT.
   O AFDT antigo identifica a pessoa pelo PIS; o layout novo, pelo CPF.
   Aceitamos os dois (11 dígitos, com dígito verificador correto). */
(function (E) {
  "use strict";

  const soDigitos = (s) => String(s || "").replace(/\D/g, "");

  function pisValido(valor) {
    const d = soDigitos(valor);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    const pesos = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const resto = pesos.reduce((s, p, i) => s + p * Number(d[i]), 0) % 11;
    const dv = 11 - resto >= 10 ? 0 : 11 - resto;
    return dv === Number(d[10]);
  }

  function cpfValido(valor) {
    const d = soDigitos(valor);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    const digito = (n) => {
      const soma = [...d.slice(0, n)].reduce((s, c, i) => s + Number(c) * (n + 1 - i), 0);
      const r = (soma * 10) % 11;
      return r === 10 ? 0 : r;
    };
    return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
  }

  E.documentos = Object.freeze({
    soDigitos,
    pisValido,
    cpfValido,
    pisOuCpfValido: (v) => pisValido(v) || cpfValido(v),
  });
})(window.Escala);

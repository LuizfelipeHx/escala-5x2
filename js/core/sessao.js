/* Login SIMULADO para apresentação. Não há segurança real aqui:
   na versão com servidor, só este arquivo precisa ser trocado. */
(function (E) {
  "use strict";

  const CHAVE = "escala5x2.sessao";
  const ERRO = "Matrícula ou senha incorretas.";

  // O navegador pode bloquear o armazenamento (aba anônima, por exemplo).
  const guardar = (valor) => { try { sessionStorage.setItem(CHAVE, JSON.stringify(valor)); } catch (_) { /* segue sem lembrar */ } };
  const ler = () => { try { return JSON.parse(sessionStorage.getItem(CHAVE)); } catch (_) { return null; } };
  const apagar = () => { try { sessionStorage.removeItem(CHAVE); } catch (_) { /* nada a fazer */ } };

  let atualEmMemoria = null;

  function buscarUsuario(matricula) {
    const colaborador = E.escala.porMatricula(matricula);
    if (colaborador) {
      const { nome, funcao, rota } = colaborador;
      return { matricula, nome, funcao, rota, perfil: "colaborador" };
    }
    const sup = E.dados.supervisores.find((s) => s.matricula === matricula);
    return sup ? { matricula, nome: sup.nome, funcao: sup.funcao, perfil: "supervisor" } : null;
  }

  function entrar(matricula, senha) {
    const usuario = buscarUsuario(String(matricula || "").trim());
    if (!usuario || senha !== E.dados.senhaDemo) return { erro: ERRO };
    atualEmMemoria = usuario;
    guardar(usuario);
    return { usuario };
  }

  function sair() {
    atualEmMemoria = null;
    apagar();
  }

  const atual = () => atualEmMemoria || (atualEmMemoria = ler());

  E.sessao = Object.freeze({ entrar, sair, atual });
})(window.Escala);

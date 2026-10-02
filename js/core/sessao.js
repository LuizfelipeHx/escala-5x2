/* Login SIMULADO para apresentação. Não há segurança real aqui:
   na versão com servidor, só este arquivo precisa ser trocado.
   Perfis: colaborador (própria escala), supervisor (sua unidade),
   gestor (todas as unidades). */
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
    const p = E.escala.porMatricula(matricula);
    if (p) {
      return { matricula, nome: p.nome, funcao: p.funcao, rota: p.rota, perfil: "colaborador", unidadeId: E.escala.unidadeDe(p).id };
    }
    const u = E.escala.unidades().find((x) => x.supervisor?.matricula === matricula);
    if (u) return { matricula, nome: u.supervisor.nome, funcao: u.supervisor.funcao, perfil: "supervisor", unidadeId: u.id };

    const g = E.dados.gestores.find((x) => x.matricula === matricula);
    return g ? { matricula, nome: g.nome, funcao: g.funcao, perfil: "gestor", unidadeId: null } : null;
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

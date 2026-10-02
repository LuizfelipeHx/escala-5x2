/* Login SIMULADO para apresentação. Não há segurança real aqui:
   na versão com servidor, só este arquivo precisa ser trocado.

   Perfis:
     colaborador  própria escala
     supervisor   o seu CDD
     coordenador  um grupo de CDDs
     gerente      todos os CDDs
   O usuário guarda "unidadeIds": as unidades que ele pode ver. */
(function (E) {
  "use strict";

  const CHAVE = "escala5x2.sessao";
  const ERRO = "Matrícula ou senha incorretas.";
  const PERFIS_LIDERANCA = ["supervisor", "coordenador", "gerente"];

  // O navegador pode bloquear o armazenamento (aba anônima, por exemplo).
  const guardar = (valor) => { try { sessionStorage.setItem(CHAVE, JSON.stringify(valor)); } catch (_) { /* segue sem lembrar */ } };
  const ler = () => { try { return JSON.parse(sessionStorage.getItem(CHAVE)); } catch (_) { return null; } };
  const apagar = () => { try { sessionStorage.removeItem(CHAVE); } catch (_) { /* nada a fazer */ } };

  let atualEmMemoria = null;

  function buscarUsuario(matricula) {
    const R = E.escala;
    const p = R.porMatricula(matricula);
    if (p) {
      if (!R.ativoEm(p, E.datas.hoje())) return null;
      return { matricula, nome: p.nome, funcao: p.funcao, rota: p.rota, perfil: "colaborador", unidadeIds: [R.unidadeDe(p).id] };
    }
    const u = R.unidades().find((x) => x.supervisor?.matricula === matricula);
    if (u) return { matricula, nome: u.supervisor.nome, funcao: u.supervisor.funcao, perfil: "supervisor", unidadeIds: [u.id] };

    const l = E.dados.liderancas.find((x) => x.matricula === matricula);
    if (!l) return null;
    const unidadeIds = l.perfil === "gerente" ? R.unidades().map((x) => x.id) : [...l.unidades];
    return { matricula, nome: l.nome, funcao: l.funcao, perfil: l.perfil, unidadeIds };
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

  // Relê o usuário a partir dos dados atuais: se ele foi desligado ou excluído
  // no cadastro, a sessão é encerrada.
  function atual() {
    const salvo = atualEmMemoria || ler();
    if (!salvo) return null;
    const usuario = buscarUsuario(salvo.matricula);
    if (!usuario) { sair(); return null; }
    atualEmMemoria = usuario;
    return usuario;
  }

  const ehLideranca = (usuario) => !!usuario && PERFIS_LIDERANCA.includes(usuario.perfil);

  E.sessao = Object.freeze({ entrar, sair, atual, ehLideranca });
})(window.Escala);

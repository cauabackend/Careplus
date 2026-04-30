import { useState } from 'react'

/**
 * useLocalStorage — hook personalizado
 *
 * Funciona exatamente como useState, mas sincroniza o valor
 * com o localStorage do navegador. Isso significa que, ao
 * fechar e reabrir o app, os dados ainda estarão lá.
 *
 * Como usar:
 *   const [usuario, setUsuario] = useLocalStorage('minha_chave', null)
 *
 * @param {string} chave    - nome da chave no localStorage
 * @param {*}      inicial  - valor padrão se não houver nada salvo
 */
export function useLocalStorage(chave, inicial) {
  // useState com "lazy initializer" (função): só roda uma vez na montagem.
  // Lê o localStorage e, se houver algo salvo, usa esse valor.
  const [valor, setValor] = useState(() => {
    const salvo = localStorage.getItem(chave)
    return salvo !== null ? JSON.parse(salvo) : inicial
  })

  // Substitui setValor: atualiza o estado React E salva no localStorage
  function salvar(novoValor) {
    setValor(novoValor)
    localStorage.setItem(chave, JSON.stringify(novoValor))
  }

  return [valor, salvar]
}

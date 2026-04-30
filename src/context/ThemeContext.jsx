import { createContext, useContext, useState, useEffect } from 'react'

/*
 * ThemeContext — fornece { tema, alternarTema } para toda a árvore de componentes.
 *
 * Por que Context API?
 *   Sem contexto, teríamos que passar `tema` e `setTema` como props
 *   por cada nível da árvore (App → Layout → Sidebar → botão).
 *   O Context "teletransporta" o estado para qualquer componente que o consuma,
 *   sem intermediários.
 */
const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // useState com função de inicialização: lê o localStorage uma única vez na montagem
  const [tema, setTema] = useState(() =>
    localStorage.getItem('cp_tema') ?? 'light'
  )

  /*
   * useEffect: toda vez que `tema` mudar, atualiza o atributo no <html>
   * O CSS usa [data-theme="dark"] para aplicar as variáveis do tema escuro.
   * Também definimos data-bs-theme para componentes Bootstrap lerem.
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    document.documentElement.setAttribute('data-bs-theme', tema)
    localStorage.setItem('cp_tema', tema)
  }, [tema])

  function alternarTema() {
    setTema(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

/*
 * useTheme — hook customizado que encapsula o contexto.
 * Uso em qualquer componente: const { tema, alternarTema } = useTheme()
 */
export function useTheme() {
  return useContext(ThemeContext)
}

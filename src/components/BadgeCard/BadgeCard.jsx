/**
 * BadgeCard — exibe uma conquista do usuário
 *
 * Props:
 *   badge → objeto com { id, nome, descricao, icone }
 *
 * Exemplo de uso:
 *   <BadgeCard badge={{ id: 'caminhante', nome: 'Caminhante', descricao: '...', icone: '👟' }} />
 */
export default function BadgeCard({ badge }) {
  // Desestruturação do objeto badge — extrai apenas o que precisamos
  const { nome, descricao, icone } = badge

  return (
    <article className="cp-badge" aria-label={`Conquista: ${nome}`}>
      <div className="cp-badge__icon" aria-hidden="true">{icone}</div>
      <div>
        <h3 className="cp-badge__nome">{nome}</h3>
        <p className="cp-badge__desc">{descricao}</p>
      </div>
    </article>
  )
}

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// cn — junta classes condicionais (clsx) e resolve conflitos do Tailwind (twMerge).
// Padrão shadcn/ui, usado pelos componentes vindos do 21st.dev.
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

import type { ReactNode } from 'react'
import { cn } from '@/libreria/clases'

export function Aviso({ children, ok, className }: { children: ReactNode; ok?: boolean; className?: string }) {
  return <p role={ok ? 'status' : 'alert'} className={cn('text-[15px] font-medium leading-snug', ok ? 'text-success' : 'text-destructive', className)}>{children}</p>
}

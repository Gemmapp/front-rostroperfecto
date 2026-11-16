import type { ReactNode } from 'react'
import { cn } from '@/libreria/clases'

/** Hoja inferior fija: radios 28px 28px 0 0 y sombra superior. */
export function InferiorHoja({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rise fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[420px] flex-col gap-2.5 rounded-t-[28px] border-t border-border bg-card px-[18px] pb-[calc(22px+env(safe-area-inset-bottom))] pt-3.5 shadow-sheet', className)}>
      {children}
    </div>
  )
}

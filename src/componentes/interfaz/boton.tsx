import { cva, type VariantProps } from 'class-variance-authority'
import { Link } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { cn } from '@/libreria/clases'

export const botonVariantes = cva(
  'press hover:brightness-[.97] inline-flex items-center justify-center gap-2 rounded-field font-sans font-semibold cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variante: {
        principal: 'bg-primary text-primary-foreground shadow-primary border-0',
        secondary: 'bg-card text-foreground border border-border',
        texto: 'bg-transparent text-muted-foreground border-0 font-medium',
        danger: 'bg-transparent text-destructive border-0 font-medium',
        inverso: 'bg-white/[0.06] text-[#F8EFF1] border border-white/20',
      },
      tamanio: {
        lg: 'h-[58px] w-full text-[17px]',
        md: 'h-12 px-5 text-[15px]',
        pastilla: 'h-11 px-4 rounded-full text-[15px]',
        sm: 'h-11 px-4 rounded-full text-sm',
      },
    },
    defaultVariants: { variante: 'principal', tamanio: 'lg' },
  },
)
type Props = VariantProps<typeof botonVariantes>

export function Boton({ variante, tamanio, className, type = 'button', ...p }: ComponentProps<'button'> & Props) {
  return <button type={type} className={cn(botonVariantes({ variante, tamanio }), className)} {...p} />
}

export function EnlaceBoton({ variante, tamanio, className, ...p }: ComponentProps<typeof Link> & Props) {
  return <Link className={cn(botonVariantes({ variante, tamanio }), 'no-underline', variante === 'principal' || !variante ? '!text-primary-foreground' : '', className)} {...p} />
}

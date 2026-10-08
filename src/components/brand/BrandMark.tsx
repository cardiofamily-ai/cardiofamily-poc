import logoUrl from '@/assets/cardiofamily-logo.svg'
import { cn } from '@/lib/utils'

export const PRODUCT_NAME = 'CardioFamily'
export const PRODUCT_TAGLINE = 'HCM Family Care POC'

/**
 * The CardioFamily logo beside its text label. The image is decorative (empty
 * alt): the visible product name always carries the meaning.
 */
export function BrandMark({ size = 'sm', className }: { size?: 'sm' | 'md'; className?: string }) {
  return (
    <div className={cn('flex items-center', size === 'sm' ? 'gap-2.5' : 'gap-3', className)} data-testid="brand-mark">
      <img src={logoUrl} alt="" width={32} height={32} className={size === 'sm' ? 'size-8' : 'size-10'} />
      <div className="leading-tight">
        <div className={cn('font-semibold', size === 'sm' ? 'text-sm' : 'text-base')}>{PRODUCT_NAME}</div>
        <div className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>{PRODUCT_TAGLINE}</div>
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'

const stroke = 'stroke-pedigree'

function Item({ symbol, children }: { symbol: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 overflow-visible">
        {symbol}
      </svg>
      <span>{children}</span>
    </li>
  )
}

export function PedigreeLegend() {
  return (
    <ul aria-label="Pedigree legend" className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-x-6 gap-y-2 text-xs text-muted-foreground">
      <Item symbol={<><rect x="1" y="5" width="13" height="13" rx="1" className={`${stroke} fill-card`} strokeWidth="1.5" /><circle cx="19" cy="11.5" r="6.5" className={`${stroke} fill-card`} strokeWidth="1.5" /></>}>
        Male · Female
      </Item>
      <Item symbol={<circle cx="12" cy="12" r="8" className={`${stroke} fill-pedigree`} strokeWidth="1.5" />}>
        Phenotype recorded
      </Item>
      <Item symbol={<><circle cx="12" cy="12" r="8" className={`${stroke} fill-card`} strokeWidth="1.5" /><line x1="12" y1="6" x2="12" y2="18" className={stroke} strokeWidth="2" /></>}>
        Genotype positive, no phenotype
      </Item>
      <Item symbol={<><rect x="5" y="5" width="14" height="14" rx="1" className={`${stroke} fill-card`} strokeWidth="1.5" /><line x1="2" y1="22" x2="22" y2="2" className={stroke} strokeWidth="1.5" /></>}>
        Deceased
      </Item>
      <Item symbol={<><line x1="2" y1="20" x2="11" y2="11" className={stroke} strokeWidth="1.5" /><path d="M13 9 l-6 1 l5 5 z" className="fill-pedigree" /></>}>
        Proband (P)
      </Item>
      <Item symbol={<><rect x="6" y="6" width="12" height="12" rx="1.5" transform="rotate(45 12 12)" className="fill-overdue" /></>}>
        Has an overdue action
      </Item>
      <Item symbol={<circle cx="12" cy="12" r="7" className="fill-due" />}>
        Has outstanding actions (count)
      </Item>
      <Item symbol={<><line x1="1" y1="12" x2="23" y2="12" className={stroke} strokeWidth="1.5" /></>}>
        Recorded parents of the children below
      </Item>
    </ul>
  )
}

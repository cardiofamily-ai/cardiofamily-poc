import { useMemo, type KeyboardEvent } from 'react'
import type { Person, PersonId } from '@/domain/family/types'
import type { GenotypeStatus } from '@/domain/genetics/genotype'
import type { PhenotypeStatus } from '@/domain/phenotype/phenotype'
import { cn } from '@/lib/utils'
import { GENOTYPE_SHORT } from '../clinical/labels'
import { layoutPedigree, SYMBOL_SIZE, type PlacedNode } from './layout'

export interface PedigreeNodeData {
  readonly name: string
  /** Short second line, e.g. "45 y" or "42 y · Proband". */
  readonly caption: string
  readonly isProband: boolean
  readonly deceased: boolean
  /** Null when genotype is not relevant (not a blood relative, or deceased). */
  readonly genotype: GenotypeStatus | null
  readonly phenotype: PhenotypeStatus
  readonly attention: { readonly count: number; readonly overdue: number }
  /** Full accessible description of the person and their status. */
  readonly description: string
}

interface PedigreeProps {
  readonly people: readonly Person[]
  readonly data: Readonly<Record<PersonId, PedigreeNodeData>>
  readonly label: string
  readonly selectedId?: PersonId | null
  readonly onSelect?: (personId: PersonId) => void
}

const PAD_X = 28
const R = SYMBOL_SIZE / 2

export function Pedigree({ people, data, label, selectedId, onSelect }: PedigreeProps) {
  const layout = useMemo(() => layoutPedigree(people), [people])
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
  const width = layout.width + PAD_X * 2

  return (
    <svg
      role="group"
      aria-label={label}
      viewBox={`${-PAD_X} 0 ${width} ${layout.height}`}
      width={width}
      height={layout.height}
      className="mx-auto block h-auto max-w-full"
    >
      <g aria-hidden className="stroke-pedigree/70" strokeWidth={1.25}>
        {layout.segments.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
        ))}
      </g>
      {layout.nodes.map((node) => {
        const person = byId.get(node.personId)
        const d = data[node.personId]
        if (!person || !d) return null
        return (
          <PedigreeNode
            key={node.personId}
            node={node}
            person={person}
            data={d}
            selected={selectedId === node.personId}
            {...(onSelect ? { onSelect } : {})}
          />
        )
      })}
    </svg>
  )
}

function PedigreeNode({
  node,
  person,
  data,
  selected,
  onSelect,
}: {
  node: PlacedNode
  person: Person
  data: PedigreeNodeData
  selected: boolean
  onSelect?: (id: PersonId) => void
}) {
  const { x, y } = node
  const affected = data.phenotype === 'present'
  const carrierUnaffected = data.genotype === 'positive' && !affected
  const interactive = Boolean(onSelect)

  const onKeyDown = (e: KeyboardEvent) => {
    if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onSelect(person.id)
    }
  }

  return (
    <g
      {...(interactive
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-pressed': selected,
            onClick: () => onSelect?.(person.id),
            onKeyDown,
          }
        : { role: 'img' })}
      aria-label={data.description}
      data-person-id={person.id}
      className={cn('group outline-none', interactive && 'cursor-pointer')}
    >
      {/* Selection / hover / focus backdrop */}
      <rect
        x={x - 64}
        y={y - R - 14}
        width={128}
        height={SYMBOL_SIZE + 92}
        rx={8}
        className={cn(
          'fill-transparent stroke-transparent transition-colors',
          interactive && 'group-hover:fill-accent/60 group-focus-visible:stroke-ring',
          selected && 'fill-accent stroke-primary/40',
        )}
        strokeWidth={1.5}
      />

      {/* Symbol: square = male, circle = female; filled = phenotype recorded */}
      {person.sex === 'male' ? (
        <rect
          x={x - R}
          y={y - R}
          width={SYMBOL_SIZE}
          height={SYMBOL_SIZE}
          rx={2}
          className={cn('stroke-pedigree', affected ? 'fill-pedigree' : 'fill-card')}
          strokeWidth={1.75}
        />
      ) : (
        <circle
          cx={x}
          cy={y}
          r={R}
          className={cn('stroke-pedigree', affected ? 'fill-pedigree' : 'fill-card')}
          strokeWidth={1.75}
        />
      )}

      {/* Genotype positive without recorded phenotype: vertical line */}
      {carrierUnaffected && (
        <line x1={x} y1={y - R + 5} x2={x} y2={y + R - 5} className="stroke-pedigree" strokeWidth={2.5} />
      )}
      {data.phenotype === 'inconclusive' && (
        <text x={x} y={y + 5} textAnchor="middle" className="fill-pedigree text-[14px] font-semibold">
          ?
        </text>
      )}

      {/* Deceased: diagonal slash */}
      {data.deceased && (
        <line x1={x - R - 6} y1={y + R + 6} x2={x + R + 6} y2={y - R - 6} className="stroke-pedigree" strokeWidth={1.75} />
      )}

      {/* Proband: arrow with "P", pointing at the lower-left of the symbol */}
      {data.isProband && (
        <g className="fill-pedigree stroke-pedigree">
          <line x1={x - R - 22} y1={y + 18} x2={x - R + 2} y2={y + 9} strokeWidth={1.75} />
          <path d={`M ${x - R + 5} ${y + 8} l -9 -2 l 3 8 z`} strokeWidth={1} strokeLinejoin="round" />
          <text x={x - R - 32} y={y + 22} className="stroke-none text-[11px] font-semibold">
            P
          </text>
        </g>
      )}

      {/* Attention badge: diamond = overdue action, circle = open actions */}
      {data.attention.count > 0 &&
        (data.attention.overdue > 0 ? (
          <g>
            <rect
              x={x + R - 6}
              y={y - R - 10}
              width={16}
              height={16}
              rx={2}
              transform={`rotate(45 ${x + R + 2} ${y - R - 2})`}
              className="fill-overdue stroke-card"
              strokeWidth={2}
            />
            <text x={x + R + 2} y={y - R + 2} textAnchor="middle" className="fill-white text-[10px] font-bold">
              {data.attention.count}
            </text>
          </g>
        ) : (
          <g>
            <circle cx={x + R + 2} cy={y - R - 2} r={9} className="fill-due stroke-card" strokeWidth={2} />
            <text x={x + R + 2} y={y - R + 2} textAnchor="middle" className="fill-white text-[10px] font-bold">
              {data.attention.count}
            </text>
          </g>
        ))}

      {/* Labels */}
      <text x={x} y={y + R + 18} textAnchor="middle" className="fill-foreground text-[12px] font-medium">
        {data.name}
      </text>
      <text x={x} y={y + R + 33} textAnchor="middle" className="fill-muted-foreground text-[11px]">
        {data.caption}
      </text>
      <text
        x={x}
        y={y + R + 48}
        textAnchor="middle"
        className={cn(
          'text-[11px]',
          data.genotype === 'positive' ? 'fill-foreground font-semibold' : 'fill-muted-foreground',
        )}
      >
        {data.genotype && GENOTYPE_SHORT[data.genotype]}
        {data.attention.overdue > 0 && (
          <tspan className="fill-overdue font-semibold">{data.genotype ? ' · ' : ''}Overdue</tspan>
        )}
      </text>
    </g>
  )
}

import type { IsoDate } from '@/domain/time'

export type FamilyId = string
export type PersonId = string
export type Sex = 'female' | 'male'

export interface Family {
  readonly id: FamilyId
  /** e.g. "Janssens family" */
  readonly name: string
  /** Synthetic display identifier, e.g. "SYN-FAM-001". */
  readonly displayCode: string
  readonly probandId: PersonId
  /** Fictional care centre. */
  readonly centre: string
  readonly synthetic: true
}

export interface Person {
  readonly id: PersonId
  readonly familyId: FamilyId
  readonly givenName: string
  readonly familyName: string
  readonly sex: Sex
  readonly dateOfBirth: IsoDate
  readonly deceasedDate?: IsoDate
  /**
   * Biological parents recorded in this family (0–2). A parent who is not
   * modelled is simply omitted. Partners are derived from shared children.
   */
  readonly parentIds: readonly PersonId[]
  readonly synthetic: true
}

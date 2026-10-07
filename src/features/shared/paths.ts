/** Route builders shared by feature screens. */
export const actionPath = (actionId: string) => `/actions/${encodeURIComponent(actionId)}`
export const profilePath = (familyId: string, personId: string) => `/families/${familyId}/people/${personId}`

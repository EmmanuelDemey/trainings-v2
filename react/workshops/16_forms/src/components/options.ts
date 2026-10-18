import { GENDERS, HAIR_COLORS } from '../schemas/person';

export const hairColorOptions = HAIR_COLORS.map((value) => ({ value, label: value }));

const genderLabels: Record<(typeof GENDERS)[number], string> = { female: 'Female', male: 'Male', 'n/a': 'Droid (n/a)' };
export const genderOptions = GENDERS.map((value) => ({ value, label: genderLabels[value] }));

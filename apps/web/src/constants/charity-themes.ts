import { CHARITY_THEME_VALUES, type CharityTheme } from '@jkopay/contracts';

export const CHARITY_THEME_LABELS: Record<CharityTheme, string> = {
  child_youth_care: '兒少照護',
  animal_protection: '動物保護',
  special_medical: '特殊醫病',
  elderly_care: '老人照護',
  disability_services: '身心障礙服務',
  women_care: '婦女關懷',
  sports_development: '運動發展',
  education_advocacy: '教育議題提倡',
  environmental_protection: '環境保護',
  multicultural: '多元族群',
  media_communication: '媒體傳播',
  public_issues: '公共議題',
  culture_arts: '文教藝術',
  community_development: '社區發展',
  poverty_relief: '弱勢扶貧',
  international_relief: '國際救援',
};

/** Figma 網格順序（與 contracts 陣列一致） */
export function listCharityThemeOptions(): { value: CharityTheme; label: string }[] {
  return CHARITY_THEME_VALUES.map((value) => ({
    value,
    label: CHARITY_THEME_LABELS[value],
  }));
}

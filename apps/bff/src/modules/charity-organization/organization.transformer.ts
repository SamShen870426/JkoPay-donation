import type { CharityOrganizationProfile, CharityTheme } from '@jkopay/contracts';
import { resolveHeroImageUrl, resolveImageUrl } from '../donation/donation.transformer.js';

type OrgWithThemes = {
  id: number;
  nameZh: string;
  logoKey: string;
  profileBannerKey: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  registrationNumberZh: string | null;
  descriptionZh: string;
  themes: { theme: string; sortOrder: number }[];
};

export function toCharityOrganizationProfile(org: OrgWithThemes): CharityOrganizationProfile {
  const bannerKey = org.profileBannerKey?.trim();
  const bannerUrl =
    bannerKey != null && bannerKey.length > 0 ? resolveHeroImageUrl(bannerKey) : null;

  return {
    id: String(org.id),
    name: org.nameZh,
    logoUrl: resolveImageUrl(org.logoKey),
    bannerUrl,
    phone: org.phone?.trim() || null,
    email: org.email?.trim() || null,
    websiteUrl: org.websiteUrl?.trim() || null,
    registrationNumber: org.registrationNumberZh?.trim() || null,
    description: org.descriptionZh,
    themes: org.themes.map((t) => t.theme as CharityTheme),
  };
}

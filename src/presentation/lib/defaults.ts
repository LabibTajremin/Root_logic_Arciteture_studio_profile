import type { SiteSettings } from '@/domain/entities/Settings';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  tenantId: '',
  studioName: 'Maapkathi',
  tagline: null,
  logoLightMediaId: null,
  logoDarkMediaId: null,
  contactEmail: null,
  contactPhone: null,
  whatsapp: null,
  address: null,
  socials: {},
  navConfig: null,
  footer: null,
  editorVerificationRequired: true,
  blogEnabled: false,
  visionMissionEnabled: false,
  visionText: null,
  missionText: null,
  logoShowTitle: true,
  showAdminShield: true,
};

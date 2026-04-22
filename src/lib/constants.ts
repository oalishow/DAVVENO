export const PASSWORD_STORAGE_KEY = 'studentAdminPassword';
export const DEFAULT_ADMIN_PASSWORD = 'ADMIN';
export const URL_STORAGE_KEY = 'studentVerifierUrl';
export const DEFAULT_PUBLIC_URL = 'https://carteirinhafajopa.netlify.app';
export const BACKUP_STORAGE_KEY = 'davveroId_local_backup';
export const RESTORE_POINT_KEY = 'davveroId_restore_point';
export const EMAIL_SETTINGS_KEY = 'davveroId_email_settings';
export const DIRECTOR_NAME_KEY = 'davveroId_director_name';
export const DEFAULT_DIRECTOR_NAME = '';
export const INSTITUTION_LOGO_KEY = 'davveroId_institution_logo';
export const INSTITUTION_NAME_KEY = 'davveroId_institution_name';
export const INSTITUTION_COLOR_KEY = 'davveroId_institution_color';
export const DIRECTOR_SIGNATURE_KEY = 'davveroId_director_signature';
export const CARD_LOGO_KEY = 'davveroId_card_logo';
export const CARD_BACK_LOGO_KEY = 'davveroId_card_back_logo';
export const CARD_FRONT_LOGO_CONFIG_KEY = 'davveroId_card_front_logo_config';
export const CARD_BACK_LOGO_CONFIG_KEY = 'davveroId_card_back_logo_config';
export const CARD_FRONT_TEXT_KEY = 'davveroId_card_front_text';
export const CARD_BACK_TEXT_KEY = 'davveroId_card_back_text';
export const CARD_VISIBLE_FIELDS_KEY = 'davveroId_card_visible_fields';
export const CARD_BACK_IMAGE_KEY = 'davveroId_card_back_image';
export const CARD_SIGNATURE_CONFIG_KEY = 'davveroId_card_signature_config';
export const INSTITUTION_DESCRIPTION_KEY = 'davveroId_institution_description';
export const CARD_DESCRIPTION_KEY = 'davveroId_card_description';
export const CUSTOM_ROLES_KEY = 'davveroId_custom_roles';
export const CUSTOM_COURSES_KEY = 'davveroId_custom_courses';
export const APP_VERSION = '4.1.0';
export const SETTINGS_DOC_PATH = (appId: string) => `artifacts/${appId}/public/data/students/_settings_global`;
export const ASSETS_DOC_PATH = (appId: string, assetType: string) => `artifacts/${appId}/public/data/students/_asset_${assetType}`;
export const CHANGELOG = [
  "Identidade Permanente: O programa agora chama-se 'DAVVERO-ID'.",
  "Dupla Assinatura: Suporte para assinaturas do Diretor e Reitor simultaneamente.",
  "Gestão de Ativos: Otimização de armazenamento para assinaturas e logotipos.",
  "Notificações Onipresentes: Alertas nativos no Windows para novas solicitações (PWA).",
  "Sincronização em nuvem das configurações (Logos, Cores e Nomes)."
];

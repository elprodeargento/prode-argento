/**
 * Feature flags controlados por variables de entorno.
 *
 * NEXT_PUBLIC_SOCIAL_FEATURES_ENABLED=true  → WhatsApp Business API e Instagram API activos
 * NEXT_PUBLIC_SOCIAL_FEATURES_ENABLED=false → Solo se deshabilitan las integraciones via API de Meta.
 *                                             Los links wa.me manuales y la exportación local de
 *                                             imágenes siguen funcionando.
 */
export const SOCIAL_ENABLED =
  process.env.NEXT_PUBLIC_SOCIAL_FEATURES_ENABLED === 'true'

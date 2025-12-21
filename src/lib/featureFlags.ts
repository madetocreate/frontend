export const enableGastro = process.env.NEXT_PUBLIC_ENABLE_GASTRO === 'true'
export const currentIndustry = (process.env.NEXT_PUBLIC_TENANT_INDUSTRY || 'general') as 'general' | 'gastronomie' | 'hotel' | 'practice' | 'realestate'

const emailPattern = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
const phonePattern = /\+?\d[\d\s-]{6,}\d/g

export const maskEmail = (text?: string) => text?.replace(emailPattern, '***@***') ?? ''

export const maskPhone = (text?: string) => text?.replace(phonePattern, '***-****') ?? ''

export const redactPII = (text?: string) => maskPhone(maskEmail(text))

/** White-label NGO profile pulled from Platform Settings (not hardcoded). */
export interface NgoReceiptProfile {
  ngoName: string
  legalName: string
  tagline: string
  registrationNumber: string
  pan: string
  eightyGNumber: string
  twelveANumber: string
  website: string
  supportEmail: string
  phone: string
  address: string
  logo: string
  primaryColor: string
  accentColor: string
  signatureImage?: string
  receiptPrefix: string
  financialYear: string
  verificationBaseUrl: string
}

export interface Receipt80GData {
  receiptNumber: string
  donationId: string
  donorName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  pan: string
  amount: number
  amountInWords: string
  paymentMethod: string
  transactionId: string
  gateway: string
  campaign: string
  purpose: string
  donationDate: string
  financialYear: string
  eightyGNumber: string
  twelveANumber: string
  ngoPan: string
  verificationUrl: string
  qrCodeDataUrl: string
  ngo: NgoReceiptProfile
  isReissued?: boolean
  status: 'PAID' | 'REISSUED'
}

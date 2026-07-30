import type { TPackageBarcodeLink } from '@/models'

export const buildPackageBarcodeLinkMap = (
  links: TPackageBarcodeLink[]
): Map<string, string> =>
  new Map(links.map((link) => [link.packageBarcode, link.productId]))

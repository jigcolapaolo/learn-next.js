import { DotGothic16, Montserrat, Lusitana } from 'next/font/google'

export const montserrat = Montserrat({ subsets: ['latin'] })
export const dotGothic = DotGothic16({ subsets: ['latin'], weight: '400' })
export const lusitana = Lusitana({ subsets: ['latin'], weight: ['400', '700'] })
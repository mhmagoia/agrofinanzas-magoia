import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Consultora Agrofinanzas Magoia', description: 'Mercados, finanzas y agro. Información y herramientas para tomar mejores decisiones.', icons: { icon: '/icono.png' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es-AR"><body>{children}</body></html>; }

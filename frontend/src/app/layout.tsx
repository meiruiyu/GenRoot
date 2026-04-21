import type { Metadata } from 'next';
import { ConditionalAppNav } from '@/components/ConditionalAppNav';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'reactflow/dist/style.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'GenRoot',
  description: 'Preserve family memories and turn shared stories into a living cultural map.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConditionalAppNav />
        {children}
      </body>
    </html>
  );
}

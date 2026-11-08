import type { Metadata } from 'next';
import { PublicProfile } from '@/components/account/PublicProfile';
export const metadata: Metadata = { title: 'Trader Profile', description: 'Public Turbo Soccer community trader profile.', robots: { index: false, follow: false }, alternates: { canonical: '/u/' } };
export default function UserProfilePage() { return <PublicProfile/>; }

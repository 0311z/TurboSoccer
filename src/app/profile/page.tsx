import type { Metadata } from 'next';
import { AccountScreen } from '@/components/account/AccountScreen';
export const metadata: Metadata = { title: 'Your Profile', description: 'Manage your Turbo Soccer trading profile, listings and privacy.', robots: { index: false, follow: false }, alternates: { canonical: '/profile/' } };
export default function ProfilePage() { return <AccountScreen/>; }

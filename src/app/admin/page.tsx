import type { Metadata } from 'next';
import { AdminScreen } from '@/components/admin/AdminScreen';
export const metadata: Metadata = { title: 'Value Workshop', description: 'Permission checked community item appraisal.', robots: { index: false, follow: false }, alternates: { canonical: '/admin/' } };
export default function AdminPage() { return <AdminScreen/>; }

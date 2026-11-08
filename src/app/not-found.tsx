import Link from 'next/link';
import { SearchX, ArrowLeft } from 'lucide-react';
export default function NotFound(){return <div className="container inner-page" style={{paddingBottom:70}}><div className="empty-state"><SearchX size={42}/><span className="eyebrow">404 · OUT OF BOUNDS</span><h1>This item left the garage.</h1><p>The page you are looking for could not be found.</p><Link href="/values/" className="btn btn-primary"><ArrowLeft size={15}/> Back to the catalog</Link></div></div>}

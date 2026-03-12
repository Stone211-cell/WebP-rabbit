import { redirect } from 'next/navigation';

export default function CRMPage() {
  // Redirect base CRM route to the explicit Dashboard route
  redirect('/crm/Dashboard');
}

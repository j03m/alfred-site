import { getLatestDate } from '@/lib/api';
import { redirect } from 'next/navigation';

export default async function Home() {
  const latestDate = await getLatestDate();
  // Split date to create URL path /v1/2025/12/06
  const [y, m, d] = latestDate.split('-');
  redirect(`/v1/${y}/${m}/${d}`);
}

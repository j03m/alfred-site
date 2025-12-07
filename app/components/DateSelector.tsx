'use client';

import { useRouter } from 'next/navigation';

interface DateSelectorProps {
  currentDate: string;
  allDates: { date: string; year: string; month: string; day: string }[];
}

export default function DateSelector({ currentDate, allDates }: DateSelectorProps) {
  const router = useRouter();

  // Sort dates descending
  const sortedDates = [...allDates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = e.target.value;
    const target = allDates.find(d => d.date === selectedDate);
    if (target) {
      router.push(`/v1/${target.year}/${target.month}/${target.day}`);
    }
  };

  return (
    <select 
      value={currentDate} 
      onChange={handleChange}
      className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-md border border-slate-200 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {sortedDates.map((d) => (
        <option key={d.date} value={d.date}>
          {d.date}
        </option>
      ))}
    </select>
  );
}

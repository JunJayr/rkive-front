import { Spinner } from '@/components/common';

interface Config {
  label: string;
  value: string | undefined | null;
}

interface Props {
  config: Config[];
}

export default function List({ config }: Props) {
  return (
    <ul role="list" className="divide-y divide-slate-100">
      {config.map(({ label, value }) => (
        <li key={label} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-6">
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <div className="text-sm font-medium text-slate-900">
            {value ? value : value === '' ? <span className="text-slate-400">—</span> : <Spinner sm />}
          </div>
        </li>
      ))}
    </ul>
  );
}

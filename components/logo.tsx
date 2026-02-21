import { Landmark } from 'lucide-react'

export const Logo = () => {
  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-100 backdrop-blur-md'>
      <Landmark className='h-4 w-4 text-blue-300' />
      FinanzasApp
    </div>
  );
};
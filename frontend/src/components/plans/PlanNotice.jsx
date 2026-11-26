import { Info } from 'lucide-react'
import { isOpenAIAvailable } from '../../services/openaiService'

// Shown wherever plans are generated or displayed. Plans are generated guidance,
// never verified route, venue or accessibility data.
export default function PlanNotice({ sample = !isOpenAIAvailable() }) {
  return (
    <div
      role="note"
      className="flex gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200 text-sm"
    >
      <Info className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p>
        <strong>Not verified accessibility information.</strong>{' '}
        {sample
          ? 'This is a sample plan built from generic templates, not from real routes, venues or transport data. '
          : 'Plans are generated suggestions. '}
        Routes, entrances, transit features and facilities mentioned here are illustrative.
        Always confirm accessibility details with the venue or operator before you rely on them.
      </p>
    </div>
  )
}

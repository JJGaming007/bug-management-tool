import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'
import { IssueDetail } from '@/components/bugs/IssueDetail'

interface PageProps {
  params: { id: string }
}

export default async function BugDetailPage({ params }: PageProps) {
  const { data: bug, error } = await supabase
    .from<Bug>('bugs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !bug) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>Unable to load issue #{params.id}.</p>
        <Link href="/bugs" className="underline mt-4 inline-block">
          ← Back to Issues
        </Link>
      </div>
    )
  }

  return <IssueDetail bug={bug} />
}

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
export default function DBHealth() {
  const [down, setDown] = useState(false)
  const check = async () => {
    try { const { error } = await supabase.from('bugs').select('id', { head: true, count: 'exact' }).limit(1); if (error) throw error; setDown(false) }
    catch { setDown(true) }
  }
  useEffect(() => { check() }, [])
  if (!down) return null
  return (
    <div style={{ background: 'rgba(239,68,68,.1)', borderBottom: '1px solid rgba(239,68,68,.4)', color: '#fecaca', padding: 8 }}>
      Database unreachable. It may be waking up. <button onClick={check} className="btn secondary" style={{ marginLeft: 8 }}>Retry</button>
    </div>
  )
}

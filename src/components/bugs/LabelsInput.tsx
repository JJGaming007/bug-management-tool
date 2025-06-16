// src/components/bugs/LabelsInput.tsx
'use client'

import { FC, useState } from 'react'

interface Props {
  value: string[]
  onChange: (labels: string[]) => void
}

export const LabelsInput: FC<Props> = ({ value, onChange }) => {
  const [input, setInput] = useState('')

  const addLabel = () => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  const removeLabel = (lbl: string) =>
    onChange(value.filter((l) => l !== lbl))

  return (
    <div>
      <label className="block mb-1">Labels</label>
      <div className="flex gap-2 mb-2 flex-wrap">
        {value.map((lbl) => (
          <span
            key={lbl}
            className="flex items-center space-x-1 bg-[var(--accent)] bg-opacity-20 text-[var(--accent)] rounded-full px-2 py-0.5 text-sm"
          >
            <span>{lbl}</span>
            <button
              type="button"
              onClick={() => removeLabel(lbl)}
              className="text-[var(--accent)] hover:text-[var(--border)]"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder="New label"
          className="flex-1 px-3 py-2 rounded-l bg-[var(--bg)] border border-r-0 border-[var(--border)] text-[var(--text)] focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
        />
        <button
          type="button"
          onClick={addLabel}
          className="px-4 py-2 bg-[var(--accent)] text-black rounded-r hover:bg-[var(--accent-hover)]"
        >
          Add
        </button>
      </div>
    </div>
  )
}

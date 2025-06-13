'use client'
import { FC, useState } from 'react'

interface Props {
  value: string[]
  onChange: (v: string[]) => void
}

export const LabelsInput: FC<Props> = ({ value, onChange }) => {
  const [input, setInput] = useState('')
  const addLabel = () => {
    if (input.trim()) {
      onChange([...value, input.trim()])
      setInput('')
    }
  }
  return (
    <div>
      <label className="block mb-1 text-[var(--text)]">Labels</label>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="
            flex-1 px-3 py-2
            bg-[var(--bg)] border border-[var(--border)]
            text-[var(--text)] rounded-lg
            focus:outline-none focus:ring focus:ring-[var(--accent-hover)]
          "
          placeholder="New label"
        />
        <button
          type="button"
          onClick={addLabel}
          className="
            px-4 py-2 
            bg-[var(--accent)] text-black rounded-lg 
            hover:bg-[var(--accent-hover)]
          "
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {value.map((lbl) => (
          <span
            key={lbl}
            className="
              px-2 py-0.5 
              bg-[var(--accent)] bg-opacity-20 
              text-[var(--accent)] rounded
            "
          >
            {lbl}
          </span>
        ))}
      </div>
    </div>
  )
}

'use client'
import { FC, useState } from 'react'

interface LabelsInputProps {
  value: string[]
  onChange: (labels: string[]) => void
}

export const LabelsInput: FC<LabelsInputProps> = ({ value, onChange }) => {
  const [input, setInput] = useState('')

  const addLabel = () => {
    const label = input.trim()
    if (label && !value.includes(label)) {
      onChange([...value, label])
      setInput('')
    }
  }

  const removeLabel = (lbl: string) => onChange(value.filter((l) => l !== lbl))

  return (
    <div className="mb-2">
      <label className="block mb-1 font-medium">Labels</label>
      <div className="flex flex-wrap gap-2 mb-1">
        {value.map((lbl) => (
          <span
            key={lbl}
            className="px-2 py-1 bg-[var(--accent)] text-black rounded-full cursor-pointer"
            onClick={() => removeLabel(lbl)}
          >
            {lbl} ×
          </span>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New label"
          className="flex-1 px-3 py-2 border rounded-l-lg"
        />
        <button
          type="button"
          onClick={addLabel}
          className="px-4 bg-[var(--accent)] rounded-r-lg text-black"
        >
          Add
        </button>
      </div>
    </div>
  )
}

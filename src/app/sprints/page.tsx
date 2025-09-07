'use client'

import React, { useState } from 'react'

export default function SprintsPage() {
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return alert('Enter sprint name')
    console.log({ name, start, end })
    setName('')
    setStart('')
    setEnd('')
  }

  return (
    <div className="content">
      <h1>Sprints</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="col" style={{ gap: 16 }}>
          <label className="col">
            <span>Sprint Name</span>
            <input
              type="text"
              placeholder="Sprint Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
          <div className="row" style={{ gap: 20 }}>
            <label className="col" style={{ flex: 1 }}>
              <span>Start Date</span>
              <input
                type="date"
                value={start}
                onChange={e => setStart(e.target.value)}
              />
            </label>
            <label className="col" style={{ flex: 1 }}>
              <span>End Date</span>
              <input
                type="date"
                value={end}
                onChange={e => setEnd(e.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="btn primary" style={{ alignSelf: 'flex-start' }}>
            Create Sprint
          </button>
        </form>
      </div>
    </div>
  )
}

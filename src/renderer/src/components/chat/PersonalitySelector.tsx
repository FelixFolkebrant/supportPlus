import { PERSONALITIES, Personality } from '../../api/personalities'

type PersonalitySelectorProps = {
  current: Personality
  onChange: (p: Personality) => void
}

export function PersonalitySelector({
  current,
  onChange
}: PersonalitySelectorProps): React.JSX.Element {
  return (
    <div className="mb-4 flex gap-2">
      <label className="font-semibold">Personality:</label>
      <select
        value={current.id}
        onChange={(e) => {
          const p = PERSONALITIES.find((p) => p.id === e.target.value)
          if (p) onChange(p)
        }}
        className="px-2 py-1"
      >
        {PERSONALITIES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}

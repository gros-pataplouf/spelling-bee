import type React from 'react'

export default function Spinner (): React.JSX.Element {
  return (
    <div className="relative h-[33vh] flex justify-center items-center">
        <div className="spinner-dot-intermittent [--spinner-color:var(--red-8)]"></div>
    </div>
  )
}

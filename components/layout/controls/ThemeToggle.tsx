'use client'

import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import styles from './NavControls.module.css'

export function ThemeToggle() {
  const {
    themeMode,
    setThemeMode,
    fireworksEnabled,
    setFireworksEnabled,
    spinePlayerEnabled,
    setSpinePlayerEnabled,
  } = useBlogRuntime()

  return (
    <div className={styles.toggleContainer}>
      <div className={styles.themeSelect}>
        <span className={styles.label}>主题</span>
        <div className={styles.selectWrapper}>
          <select value={themeMode} onChange={(event) => setThemeMode(event.target.value as typeof themeMode)}>
            <option value="light">Arona</option>
            <option value="dark">Plana</option>
            <option value="system">System</option>
          </select>
          <span className={styles.selectArrow}>▼</span>
        </div>
      </div>
      <ToggleItem
        id="fireworksEnabled"
        label="烟花"
        checked={fireworksEnabled}
        onChange={setFireworksEnabled}
      />
      <ToggleItem
        id="spinePlayerEnabled"
        label="Spine"
        checked={spinePlayerEnabled}
        onChange={setSpinePlayerEnabled}
      />
    </div>
  )
}

function ToggleItem({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className={styles.toggleItem}>
      <span className={styles.label}>{label}</span>
      <input id={id} type="checkbox" checked={checked} onChange={() => onChange(!checked)} />
      <label htmlFor={id} className={styles.toggleSwitch} />
    </div>
  )
}

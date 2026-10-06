import React, { useEffect, useState } from "react"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Dayjs } from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LoadingButton, NeutralButton } from "@/components/Button"
import { ItemData } from "@/components/RowItem"
import { RegisteredEntry } from "@/common-types"

import styles from "./RegisterTimeView.module.css"

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#68a8ff',
    },
    background: {
      default: '#101d30',
      paper: '#101d30',
    },
  },
})

type RegisterTimeViewProps = {
  items: Array<ItemData>
  registeredEntries: Array<RegisteredEntry>
  onRegister: (hours: number, date: Date, project: string) => Promise<void>
}

function RegisterTimeView({
  items,
  registeredEntries,
  onRegister,
}: RegisterTimeViewProps) {
  const [hours, setHours] = useState(0)
  const [project, setProject] = useState('')
  const [date, setDate] = useState(new Date())
  const [loading, setLoading] = useState(false)

  async function onSubmit (event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    try {
      await onRegister(hours, date, project)
    } finally {
      setLoading(false)
    }
  }

  function handleQuickSelection (event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    const newValue = parseFloat(event.currentTarget.textContent || '0')

    // Set the hours to the value of the button
    setHours(newValue)
  }

  function onChange (event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseFloat(event.target.value)
    setHours(Number.isFinite(newValue) ? newValue : 0)
  }

  function onSetDate (newDate: Dayjs) {
    const year = newDate.year()
    const month = newDate.month()
    const day = newDate.date()

    const utc = new Date()
    utc.setUTCFullYear(year)
    utc.setUTCMonth(month)
    utc.setUTCDate(day)
    utc.setUTCHours(0, 0, 0, 0)

    setDate(utc)
  }

  function onSetProject (event: React.ChangeEvent<HTMLSelectElement>) {
    setProject(event.target.value)
  }

  useEffect(() => {
    if (items.length === 0) {
      return
    }

    setProject(items[0]?.name)
  }, [items])

  const weekStart = new Date()
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
  const weekHours = Array.from({ length: 7 }, (_, dayIndex) => {
    const day = new Date(weekStart)
    day.setDate(day.getDate() + dayIndex)
    return registeredEntries
      .filter((entry) => entry.date.toDateString() === day.toDateString() && (!project || entry.project === project))
      .reduce((total, entry) => total + entry.hours, 0)
  })
  const totalWeekHours = weekHours.reduce((total, hours) => total + hours, 0)
  const maxDayHours = Math.max(...weekHours, 1)

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={styles.titleRow}>
        <div>
          <h2>Register time</h2>
          <p>Log hours to keep your projects on track.</p>
        </div>
        <a className={styles.addClientLink} href="#clients">＋ Add new client</a>
      </div>

      <form className={styles.registerForm} onSubmit={onSubmit}>
        <label>
          Project / Client
          <select className={styles.select} value={project} onChange={onSetProject} required>
            {items.length === 0 && <option value="">Add a project first</option>}
            {items.map((item, index) => {
              return <option key={index} value={item.name}>{item.name}</option>
            })}
          </select>
        </label>
        <div className={styles.datePanel}>
          <div className={styles.calendar}>
            <span className={styles.fieldLabel}>Date</span>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar views={['day']} onChange={onSetDate} />
            </LocalizationProvider>
          </div>
          <div className={styles.weekSummary}>
            <span className={styles.fieldLabel}>This week</span>
            <strong>{Number(totalWeekHours.toFixed(2))}h</strong>
            <span className={styles.totalLabel}>Total time</span>
            <div className={styles.weekChart} aria-label="Hours tracked each day this week">
              {weekHours.map((hours, index) => (
                <div className={styles.weekDay} key={index}>
                  <div className={styles.weekBarTrack}>
                    <span
                      className={index === 1 ? styles.weekBarActive : styles.weekBar}
                      style={{ height: `${Math.max(10, (hours / maxDayHours) * 100)}%` }}
                    />
                  </div>
                  <span className={styles.weekDayName}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
                  <span className={styles.weekDayHours}>{Number(hours.toFixed(2))}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.inputRow}>
          <label htmlFor="hours" className={styles.fieldLabel}>Time spent</label>
          <input id="hours" className={styles.field} type="number" min="0.25" step="0.25" required onChange={onChange} value={hours || ''} />
          <div className={styles.quickButtons}>
            <NeutralButton action={handleQuickSelection} text={'0.25'} />
            <NeutralButton action={handleQuickSelection} text={'0.5'} />
            <NeutralButton action={handleQuickSelection} text={'1'} />
            <NeutralButton action={handleQuickSelection} text={'2'} />
            <NeutralButton action={handleQuickSelection} text={'4'} />
            <NeutralButton action={handleQuickSelection} text={'8'} />
          </div>
        </div>
        <div className={styles.submit}>
          <LoadingButton loading={loading} text="Submit time" action={() => {}} />
        </div>
      </form>
    </ThemeProvider>
  )
}

export default RegisterTimeView
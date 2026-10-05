import React, { useEffect, useState } from "react"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Dayjs } from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LoadingButton, NeutralButton } from "@/components/Button"
import { ItemData } from "@/components/RowItem"

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
  onRegister: (hours: number, date: Date, project: string) => Promise<void>
}

function RegisterTimeView({
  items,
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
    const newValue = parseInt(event.currentTarget.textContent || '0')

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

  return (
    <ThemeProvider theme={darkTheme}>
      <h2>Register time</h2>
      <p>Log hours to keep your projects on track.</p>

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
        <div className={styles.calendar}>
          <span className={styles.fieldLabel}>Date</span>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar views={['day']} onChange={onSetDate} />
          </LocalizationProvider>
        </div>
        <div className={styles.inputRow}>
          <label htmlFor="hours" className={styles.fieldLabel}>Time spent (hours)</label>
          <input id="hours" className={styles.field} type="number" min="0.25" step="0.25" required onChange={onChange} value={hours || ''} />
          <div className={styles.quickButtons}>
            <NeutralButton action={handleQuickSelection} text={'1'} />
            <NeutralButton action={handleQuickSelection} text={'2'} />
            <NeutralButton action={handleQuickSelection} text={'4'} />
            <NeutralButton action={handleQuickSelection} text={'8'} />
          </div>
        </div>
        <div className={styles.submit}>
          <LoadingButton loading={loading} text="Log time" action={() => {}} />
        </div>
      </form>
    </ThemeProvider>
  )
}

export default RegisterTimeView
import React, { useEffect, useState } from "react"
import { RegisteredEntry } from "@/common-types"
import { DeleteButton } from "@/components/Button"
import { getEndOfMonth, getStartOfMonth, turnDateIntoString } from "@/utils/dates"

import styles from "./TimeReport.module.css"

type ProjectEntry = {
  name: string,
  hours: number
}

type Entry = {
  id: string,
  projects: Array<ProjectEntry>
}

type TableList = {
  entry: Array<Entry>
}

function getWeek(date: Date) {
  const onejan = new Date(date.getFullYear(), 0, 1)
  return Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7)
}

function TableWithDate({ id, projects }: Entry) {
  return (
    <div className={styles.projectsTable}>
      <h3>{id}</h3>
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => {
            return (
              <tr key={index}>
                <td>{project.name}</td>
                <td>{project.hours}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}


/**
 * Simple report that lists all entries
 * @param registeredEntries
 * @returns 
 */
function AllEntryReport({ registeredEntries, onDelete }: { registeredEntries: Array<RegisteredEntry>, onDelete?: (entryId: string) => void }) {
  const sortedEntries = [...registeredEntries].sort((a, b) => {
    if (a.date < b.date) {
      return -1
    }
    if (a.date > b.date) {
      return 1
    }
    return 0
  })

  return (
    <table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Date</th>
          <th>Hours</th>
          <th className={styles.actionColumn} />
        </tr>
      </thead>
      <tbody>
        {sortedEntries.map((entry, index) => {
          return (
            <tr key={index}>
              <td>{entry.project}</td>
              <td>{entry.date.toDateString()}</td>
              <td>{entry.hours}</td>
              <td className={styles.actionColumn}><DeleteButton action={() => {
                onDelete?.(entry.entryId)
              }} /></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function DailyReport({ registeredEntries }: { registeredEntries: Array<RegisteredEntry> }) {
  // Bundle all the entries for the same day and project
  const dailyEntries = registeredEntries.reduce((acc, entry) => {
    const key = `${entry.date.toDateString()}-${entry.project}`
    if (!acc[key]) {
      acc[key] = { date: entry.date, project: entry.project, hours: 0 }
    }
    acc[key].hours += entry.hours
    return acc
  }
  , {} as { [key: string]: { date: Date, project: string, hours: number } })

  // Convert the object back to an array
  const dailyEntryArray = Object.values(dailyEntries)

  // Transform to a daily table list
  var dailyTableList: TableList = { entry: [] }

  // Sort according to date
  dailyEntryArray.sort((a, b) => {
    if (a.date < b.date) {
      return -1
    }
    if (a.date > b.date) {
      return 1
    }
    return 0
  })

  dailyEntryArray.forEach((entry) => {
    const date = entry.date.toDateString()
    const project = entry.project
    const hours = entry.hours

    const existingEntry = dailyTableList.entry.find((entry) => entry.id === date)
    if (existingEntry) {
      const existingProject = existingEntry.projects.find((p) => p.name === project)
      if (existingProject) {
        existingProject.hours += hours
      } else {
        existingEntry.projects.push({ name: project, hours: hours })
      }
    } else {
      dailyTableList.entry.push({
        id: entry.date.toDateString(),
        projects: [{ name: project, hours: hours }]
      })
    }
  })

  return (
    <div className={styles.tableList}>
      {dailyTableList.entry.map((entry, index) => {
        return <TableWithDate key={index} id={entry.id} projects={entry.projects} />
      })}
    </div>
  )
}

function WeeklyReport({ registeredEntries }: { registeredEntries: Array<RegisteredEntry> }) {
  // Bundle all the entries for the same week
  const weeklyEntries = registeredEntries.reduce((acc, entry) => {
    const week = getWeek(entry.date)
    const key = `${week}-${entry.project}`
    if (!acc[key]) {
      acc[key] = { date: entry.date, project: entry.project, hours: 0 }
    }
    acc[key].hours += entry.hours
    return acc
  }, {} as { [key: string]: { date: Date, project: string, hours: number } })

  // Convert the object back to an array
  const weeklyEntryArray = Object.values(weeklyEntries)

  // Transform to a daily table list
  var weeklyTableList: TableList = { entry: [] }

  // Sort according to week number
  weeklyEntryArray.sort((a, b) => {
    if (a.date < b.date) {
      return -1
    }
    if (a.date > b.date) {
      return 1
    }
    return 0
  })

  weeklyEntryArray.forEach((entry) => {
    const week = getWeek(entry.date)
    const project = entry.project
    const hours = entry.hours

    const existingEntry = weeklyTableList.entry.find((entry) => entry.id === week.toString())
    if (existingEntry) {
      const existingProject = existingEntry.projects.find((p) => p.name === project)
      if (existingProject) {
        existingProject.hours += hours
      } else {
        existingEntry.projects.push({ name: project, hours: hours })
      }
    } else {
      weeklyTableList.entry.push({
        id: week.toString(),
        projects: [{ name: project, hours: hours }]
      })
    }
  })

  return (
    <div className={styles.tableList}>
      {weeklyTableList.entry.map((entry, index) => {
        return <TableWithDate key={index} id={entry.id} projects={entry.projects} />
      })}
    </div>
  )
}

function MonthlyReport({ registeredEntries }: { registeredEntries: Array<RegisteredEntry> }) {
  function getMonthName(month: number) {
    const months = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ]
    return months[month]
  }

  // Bundle all the entries for the same month and year
  const monthlyEntries = registeredEntries.reduce((acc, entry) => {
    const key = entry.date.getMonth() + '-' + entry.date.getFullYear() + '-' + entry.project
    if (!acc[key]) {
      acc[key] = { date: entry.date, project: entry.project, hours: 0 }
    }
    acc[key].hours += entry.hours
    return acc
  }
  , {} as { [key: string]: { date: Date, project: string, hours: number } })

  // Convert the object back to an array
  const monthlyEntryArray = Object.values(monthlyEntries)

  // Transform to a monthly table list
  var monthlyTableList: TableList = { entry: [] }

  // Sort according to month
  monthlyEntryArray.sort((a, b) => {
    if (a.date < b.date) {
      return -1
    }
    if (a.date > b.date) {
      return 1
    }
    return 0
  })

  monthlyEntryArray.forEach((entry) => {
    const month = entry.date.getMonth()
    const year = entry.date.getFullYear()
    const hours = entry.hours

    const existingEntry = monthlyTableList.entry.find((entry) => entry.id === `${getMonthName(month)} ${year}`)
    if (existingEntry) {
      existingEntry.projects.push({ name: entry.project, hours: hours })
    } else {
      monthlyTableList.entry.push({
        id: `${getMonthName(month)} ${year}`,
        projects: [{ name: entry.project, hours: hours }]
      })
    }
  })

  return (
    <div className={styles.tableList}>
      {monthlyTableList.entry.map((entry, index) => {
        return <TableWithDate key={index} id={entry.id} projects={entry.projects} />
      })}
    </div>
  )
}

type TimeReportViewProps = {
  registeredEntries: Array<RegisteredEntry>,
  onDelete?: (entryId: string) => void
  onSetNewDateRange?: (from: string, to: string) => void
}

export function TimeReportView({ registeredEntries, onDelete, onSetNewDateRange }: TimeReportViewProps) {
  const [reportStyle, setReportStyle] = useState("raw")
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const projectTotals = Array.from(
    registeredEntries.reduce((totals, entry) => {
      totals.set(entry.project, (totals.get(entry.project) || 0) + entry.hours)
      return totals
    }, new Map<string, number>()),
    ([name, hours]) => ({ name, hours })
  ).sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name))
  const totalHours = registeredEntries.reduce((total, entry) => total + entry.hours, 0)
  const maxProjectHours = projectTotals[0]?.hours || 0

  const handleReportStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setReportStyle(event.target.value)
  }

  useEffect(() => {
    const today = new Date()
    const startOfMonth = getStartOfMonth(today)
    const endOfMonth = getEndOfMonth(today)
    setStartDate(startOfMonth)
    setEndDate(endOfMonth)
    onSetNewDateRange?.(turnDateIntoString(startOfMonth), turnDateIntoString(endOfMonth))
  }, [onSetNewDateRange])

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(event.target.value))
    onSetNewDateRange?.(event.target.value, turnDateIntoString(endDate))
  }

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(new Date(event.target.value))
    onSetNewDateRange?.(turnDateIntoString(startDate), event.target.value)
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <h2>Time report</h2>
          <p>See where your time is going.</p>
        </div>
        <div className={styles.reportControls}>
          <div className={styles.dateRange}>
            <label>
              <span>From</span>
              <input
                type="date"
                value={turnDateIntoString(startDate)}
                onChange={handleStartDateChange}
              />
            </label>
            <label>
              <span>To</span>
              <input
                type="date"
                value={turnDateIntoString(endDate)}
                onChange={handleEndDateChange}
              />
            </label>
          </div>
          <select aria-label="Report format" className={styles.select} value={reportStyle} onChange={handleReportStyleChange}>
            <option value="raw">All entries</option>
            <option value="daily">Day by day</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.statCard}>
          <span>Total tracked</span>
          <strong>{Number(totalHours.toFixed(2))}<small> hrs</small></strong>
        </div>
        <div className={styles.statCard}>
          <span>Projects</span>
          <strong>{projectTotals.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Time entries</span>
          <strong>{registeredEntries.length}</strong>
        </div>
      </div>

      <section className={styles.breakdown} aria-labelledby="project-breakdown-title">
        <div className={styles.breakdownHeader}>
          <div>
            <h3 id="project-breakdown-title">Project breakdown</h3>
            <p>Hours tracked in this date range</p>
          </div>
        </div>
        {projectTotals.length === 0 ? (
          <p className={styles.emptyState}>No time logged in this date range yet.</p>
        ) : (
          <div className={styles.chart} role="img" aria-label="Hours tracked for each project">
            {projectTotals.map((project) => (
              <div className={styles.chartRow} key={project.name}>
                <div className={styles.chartLabel}>
                  <span title={project.name}>{project.name}</span>
                  <strong>{Number(project.hours.toFixed(2))} hrs</strong>
                </div>
                <div className={styles.barTrack} aria-hidden="true">
                  <div
                    className={styles.bar}
                    style={{ width: `${(project.hours / maxProjectHours) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {reportStyle === "raw" && <AllEntryReport registeredEntries={registeredEntries} onDelete={onDelete} />}
      {reportStyle === "daily" && <DailyReport registeredEntries={registeredEntries} />}
      {reportStyle === "weekly" && <WeeklyReport registeredEntries={registeredEntries} />}
      {reportStyle === "monthly" && <MonthlyReport registeredEntries={registeredEntries} />}
    </>
  )
}
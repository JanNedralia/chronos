'use client'

import React, { useCallback, useEffect, useRef, useState } from "react"
import { ItemData } from "@/components/RowItem"
import { TimeReportView } from "@/components/TimeReportView"
import { RegisteredEntry } from "@/common-types"
import ClientListView from "@/components/ClientListView"
import RegisterTimeView from "@/components/RegisterTimeView"
import API, { ErrorCode, ErrorResponse, DailyReportEntry } from "@/api"
import { getEndOfMonth, getStartOfMonth, turnDateIntoString } from "@/utils/dates"

import styles from "../app/page.module.css"

const views = [
  { id: 'clients', label: 'Clients' },
  { id: 'register-time', label: 'Register time' },
  { id: 'report', label: 'Time report' },
] as const

/**
 * MainView component is the main entry point for the Chronos time tracking application.
 * It manages the state and interactions for clients and time entries.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <MainView />
 *
 * @remarks
 * This component uses several hooks to manage state and side effects:
 * - `useState` to manage the state of items, registered entries, and loading status.
 * - `useCallback` to memoize functions that perform API calls and state updates.
 * - `useEffect` to trigger the initial loading of the client list.
 *
 * The component includes the following main functionalities:
 * - Fetching and displaying a list of clients.
 * - Registering time entries for clients.
 * - Adding and deleting clients.
 *
 * @function
 * @name MainView
 */
export default function MainView() {
  const [activeView, setActiveView] = useState<typeof views[number]['id']>('clients')
  const [items, setItems] = useState<Array<ItemData>>([])
  const [registeredEntries, setRegisteredEntries] = useState<Array<RegisteredEntry>>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => turnDateIntoString(getStartOfMonth(new Date())))
  const [endDate, setEndDate] = useState(() => turnDateIntoString(getEndOfMonth(new Date())))
  const latestEntriesRequest = useRef(0)
  const pendingEntryDeletions = useRef(new Set<string>())
  const [deletingEntryIds, setDeletingEntryIds] = useState<ReadonlySet<string>>(new Set())

  /**
   * Logout the user by removing the access token and user ID from local storage
   * @returns void
   */
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("userId")

    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }, [])

  /**
   * Fetch the time entries for a client
   * @param clientId The ID of the client to fetch time entries for
   * @returns An array of time entries for the client
   * */
  const getEntries = useCallback(async (clientId: string | undefined): Promise<RegisteredEntry[]> => {
    const api = new API()

    try {
      const response = await api.getTimeEntries({ clientId: clientId, from: startDate, to: endDate, mode: 'daily' })
  
      if (response === null) {
        return []
      }

      // Response will be an object with arrays of entries for each client if no client ID is provided
      if (!clientId) {
        const allValues = Object.values(response) as DailyReportEntry[][]
        const allEntries = allValues.flat()

        return allEntries.map((entry: DailyReportEntry) => {
          return {
            hours: entry.Duration,
            date: new Date(entry.Date),
            project: entry.ClientId,
            entryId: entry.EntryId
          }
        })
      }
  
      if (!Array.isArray(response.data)) {
        return []
      }
  
      return response.data.map((entry: DailyReportEntry) => {
        return {
          hours: entry.Duration,
          date: new Date(entry.Date),
          project: entry.ClientId,
          entryId: entry.EntryId
        }
      })
    } catch(error) {
      if ((error as ErrorResponse).code === ErrorCode.Unauthorized) {
        logout()
      }

      return []
    }
  }, [logout, startDate, endDate])

  /**
   * Refresh the list of time entries for all clients
   * @returns void
   * */
  const refreshTimeEntries = useCallback(async () => {
    // Only apply the response of the latest request so that a slow response for an
    // older date range never overwrites the data for the currently selected range
    const requestId = ++latestEntriesRequest.current
    const allEntries = await getEntries(undefined)

    if (requestId !== latestEntriesRequest.current) {
      return
    }

    setRegisteredEntries(allEntries.flat())
  }, [getEntries, setRegisteredEntries])

  /**
   * Register time for a client
   * @param hours The number of hours to register
   * @param date The date to register the hours for
   * @param project The name of the client to register the hours for
   * @returns void
   * */
  const onRegisterTime = useCallback( async (hours: number, date: Date, project: string) => {
    if (!hours || !date || !project) {
      return
    }

    const api = new API()
    const response = await api.registerTime({ clientId: project, duration: hours, date: date.toISOString() })

    if (response.error) {
      console.error(response.error)
      return
    }

    await refreshTimeEntries()
  }, [refreshTimeEntries])

  /**
   * Refresh the list of clients
   * @returns void
   * */
  const refreshClientList = useCallback(async () => {
    const api = new API()

    try {
      const response = await api.getClients()
  
      if (response === null) {
        return
      }
  
      const items = response.map((item: string) => {
        return { name: item, isUpdating: false }
      })
  
      setItems(items)
      setLoading(false)

    } catch(error) {
      if ((error as ErrorResponse).code === ErrorCode.Unauthorized) {
        logout()
      }
    }
  }, [logout])

  /**
   * Add a new client to the list
   * @param name The name of the client to add
   * @returns void
   * */
  const addItem = useCallback(async (name: string) => {
    const api = new API()
    setItems([...items, { name, isUpdating: true }])
    const response = await api.createClient(name)

    if (response.error) {
      console.error(response.error)
      return
    }

    await refreshClientList()
  }, [refreshClientList, setItems, items])

  /**
   * Delete a client from the list
   * @param name The name of the client to delete
   * @returns void
   * */
  const deleteItem = useCallback(async (name: string) => {
    const api = new API()
    const deletedItem = items.find((item) => item.name === name)

    if (deletedItem) {
      deletedItem.isUpdating = true
      setItems([...items])
    }

    const response = await api.deleteClient(name)

    if (response.error) {
      console.error(response.error)
      return
    }

    await refreshClientList()
  }, [refreshClientList, items])

  const deleteEntry = useCallback(async (entryId: string) => {
    if (pendingEntryDeletions.current.has(entryId)) {
      return
    }

    pendingEntryDeletions.current.add(entryId)
    setDeletingEntryIds(new Set(pendingEntryDeletions.current))

    try {
      const api = new API()
      const response = await api.deleteTimeEntry(entryId)

      if (response.error) {
        console.error(response.error)
        return
      }

      await refreshTimeEntries()
    } catch (error) {
      console.error(error)
    } finally {
      pendingEntryDeletions.current.delete(entryId)
      setDeletingEntryIds(new Set(pendingEntryDeletions.current))
    }
  }, [refreshTimeEntries])

  const handleChangeDateRange = useCallback((from: string, to: string) => {
    setStartDate(from)
    setEndDate(to)
  }, [])

  useEffect(() => {
    refreshClientList()
  }, [refreshClientList])

  useEffect(() => {
    refreshTimeEntries()
  }, [refreshTimeEntries])

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="#clients" onClick={() => setActiveView('clients')}>
          <span className={styles.brandMark} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          <span>
            <strong>Chronos</strong>
            <small>Time tracking made simple</small>
          </span>
        </a>

        <nav className={styles.navigation} aria-label="Main navigation">
          <a className={`${styles.navLink} ${styles.active}`} href="#clients">
            <span aria-hidden="true">⌂</span> Clients
          </a>
          <p className={styles.navLabel}>Manage</p>
          <a className={styles.navLink} href="#register-time">
            <span aria-hidden="true">◷</span> Register time
          </a>
          <a className={styles.navLink} href="#report">
            <span aria-hidden="true">▤</span> Time report
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.account}>
            <span className={styles.avatar} aria-hidden="true">JD</span>
            <span><strong>My account</strong><small>Time tracker</small></span>
          </div>
          <button className={styles.logout} onClick={logout}>
            <span aria-hidden="true">↪</span> Log out
          </button>
        </div>

        <nav className={styles.mobileTabs} aria-label="Choose view">
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              className={`${styles.navLink} ${activeView === view.id ? styles.active : ''}`}
              aria-pressed={activeView === view.id}
              aria-controls={view.id}
              onClick={() => setActiveView(view.id)}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className={styles.workspace}>
        <header className={styles.pageHeader}>
          <div>
            <h1>
              <span className={styles.desktopTitle}>Clients</span>
              <span className={styles.mobileTitle}>{views.find((view) => view.id === activeView)?.label}</span>
            </h1>
            <p>View and manage your clients and time tracking.</p>
          </div>
        </header>

        <div className={styles.content}>
          <section id="clients" className={`${styles.section} ${styles.clientsSection} ${activeView !== 'clients' ? styles.mobileHidden : ''}`}>
          <ClientListView addItem={addItem} deleteItem={deleteItem} items={items} loading={loading} />
          </section>

          <section id="register-time" className={`${styles.section} ${styles.registerSection} ${activeView !== 'register-time' ? styles.mobileHidden : ''}`}>
          <RegisterTimeView items={items} registeredEntries={registeredEntries} onRegister={onRegisterTime} onShowClients={() => setActiveView('clients')} />
          </section>

          <section id="report" className={`${styles.section} ${styles.reportSection} ${activeView !== 'report' ? styles.mobileHidden : ''}`}>
          <TimeReportView
            registeredEntries={registeredEntries}
            startDate={startDate}
            endDate={endDate}
            onDelete={deleteEntry}
            deletingEntryIds={deletingEntryIds}
            onSetNewDateRange={handleChangeDateRange}
          />
          </section>
        </div>
      </main>
    </div>
  )
}

'use client'

import React, { useCallback, useEffect, useState } from "react"
import { ItemData } from "@/components/RowItem"
import { TimeReportView } from "@/components/TimeReportView"
import { RegisteredEntry } from "@/common-types"
import ClientListView from "@/components/ClientListView"
import RegisterTimeView from "@/components/RegisterTimeView"
import API, { ErrorCode, ErrorResponse, DailyReportEntry } from "@/api"

import styles from "../app/page.module.css"

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
  const [items, setItems] = useState<Array<ItemData>>([])
  const [registeredEntries, setRegisteredEntries] = useState<Array<RegisteredEntry>>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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
    const allEntries = await getEntries(undefined)
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
    const api = new API()
    const response = await api.deleteTimeEntry(entryId)

    if (response.error) {
      console.error(response.error)
      return
    }

    await refreshTimeEntries()
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
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.row}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">C</span>
            <h1>Chronos</h1>
          </div>
          <button className={styles.logout} onClick={logout}>Logout</button>
        </div>
        <p>Your time, clearly accounted for.</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <ClientListView addItem={addItem} deleteItem={deleteItem} items={items} loading={loading} />
        </section>

        <section className={styles.section}>
          <RegisterTimeView items={items} onRegister={onRegisterTime} />
        </section>

        <section className={styles.section}>
          <TimeReportView
            registeredEntries={registeredEntries}
            onDelete={deleteEntry}
            onSetNewDateRange={handleChangeDateRange}
          />
        </section>
      </div>
    </main>
  )
}

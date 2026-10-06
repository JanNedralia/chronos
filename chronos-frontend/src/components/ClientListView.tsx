import React, { useState } from "react"
import { RowItem, ItemData } from "@/components/RowItem"
import { AddRowView } from "@/components/AddRowView"
import Loader from "react-spinners/PulseLoader"
import styles from "./ClientListView.module.css"

type ClientListViewProps = {
  addItem: (name: string) => void
  deleteItem: (id: string) => void
  items: Array<ItemData>
  loading: boolean
}

function ClientListView({ addItem, deleteItem, items, loading }: ClientListViewProps) {
  const [search, setSearch] = useState("")
  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <>
      <div className={styles.heading}>
        <h2>Clients</h2>
        <span className={styles.count}>{items.length}</span>
      </div>
      <label className={styles.search}>
        <span className={styles.visuallyHidden}>Search clients</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search clients..."
        />
        <span aria-hidden="true">⌕</span>
      </label>

      <div className={styles.list}>
        {loading && <Loader color={"white"} />}
        {!loading && items.length === 0 && <p className={styles.empty}>Add your first client below.</p>}
        {!loading && items.length > 0 && filteredItems.length === 0 && (
          <p className={styles.empty}>No clients match “{search}”.</p>
        )}
        {!loading && filteredItems.map((item, index) => (
          <RowItem key={`${item.name}-${index}`} item={item} delete={deleteItem} />
        ))}
      </div>

      {!loading && (
        <details className={styles.addClient}>
          <summary><span aria-hidden="true">+</span> Add new client</summary>
          <AddRowView addItem={addItem} />
        </details>
      )}
    </>
  )
}

export default ClientListView
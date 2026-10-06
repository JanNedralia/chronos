import React, { useState } from "react"
import BarLoader from "react-spinners/BarLoader"
import { NeutralButton, DeleteButton } from "@/components/Button"
import styles from "./RowItem.module.css"

export type ItemData = {
    name: string;
    isUpdating: boolean; // Flag to indicate if the item is being updated towards server
}

type RowItemProps = {
    item: ItemData;
    delete: (name: string) => void;
};

export function RowItem(props: RowItemProps) {
    const [confirmDelete, setConfirmDelete] = useState(false)

    const handleButtonAction = () => {
        setConfirmDelete(true)
    }

    const handleDelete = () => {
        props.delete(props.item.name)
        setConfirmDelete(false)
    }

    const cancelDelete = () => {
        setConfirmDelete(false)
    }

    return (
        <div className={styles.rowItem}>
            <p className={styles.paragraph}>{props.item.name}</p>
            {props.item.isUpdating && <BarLoader color={"white"} />}
            <div className={confirmDelete ? styles.confirmActions : styles.actions}>
                {confirmDelete && <DeleteButton text="Confirm delete" action={handleDelete} />}
                {confirmDelete && <NeutralButton text="Cancel" action={cancelDelete} />}
                {!confirmDelete && <DeleteButton action={handleButtonAction} />}
            </div>
        </div>
    )
}
import Loader from "react-spinners/PulseLoader"

import styles from "./Button.module.css"

type ButtonProps = {
    action: (event: React.MouseEvent<HTMLButtonElement>) => void;
    text?: string;
    loading?: boolean;
};

// A button with an action handler. It is a square button with a plus sign and rounded corners.
export function Button(props: ButtonProps) {
    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.action(event)
    }

    return (
        <button className={styles.addButton} onClick={onClick}>
            {props.text || "+"}
        </button>
    )
}

export function LoadingButton(props: ButtonProps) {
    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.action(event)
    }

    return (
        <button disabled={props.loading } className={styles.loadingButton} onClick={onClick}>
            {props.loading && <Loader color={"white"} />}
            {!props.loading && 
                <p>{props.text || "..."}</p>
            }
        </button>
    )
}
  
// A neutral button with text.
export function NeutralButton(props: ButtonProps) {
    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.action(event)
    }

    return (
        <>
            <button className={styles.neutralButton} onClick={onClick}>
                {props.text}
            </button>
        </>
    )
}

function TrashIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16" />
            <path d="M10 11v6M14 11v6" />
            <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
            <path d="M9 7V4h6v3" />
        </svg>
    )
}

export function DeleteButton(props: ButtonProps) {
    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!props.loading) {
            props.action(event)
        }
    }

    return (
        <>
            <button disabled={props.loading} aria-busy={props.loading} aria-label={props.loading ? "Deleting…" : props.text || "Delete"} title={props.loading ? "Deleting…" : props.text || "Delete"} className={styles.deleteButton} onClick={onClick}>
                {props.loading ? <Loader color="currentColor" size={4} margin={2} /> : props.text || <TrashIcon />}
            </button>
        </>
    )
}
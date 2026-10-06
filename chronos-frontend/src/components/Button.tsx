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

export function DeleteButton(props: ButtonProps) {
    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.action(event)
    }

    return (
        <>
            <button aria-label={props.text || "Delete"} className={styles.deleteButton} onClick={onClick}>
                {props.text || "-"}
            </button>
        </>
    )
}
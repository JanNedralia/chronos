import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js'

import styles from './SignupView.module.css'

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '', // Your user pool id here
  ClientId: process.env.NEXT_PUBLIC_CLIENT_ID || '', // Your client id here
}

const userPool = new CognitoUserPool(poolData)

function SignupView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [code, setCode] = useState('')
  const [valid, setValid] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault()

    userPool.signUp(email, password, [], [], (err, result) => {
        if (err) {
            console.error('Error signing up', err)
            setError(err.message)
            return
        }
        console.log('User signed up:', result)
        setConfirm(true)
        }
    )
  }

  const handleConfirm = () => {
    const userData = {
        Username: email,
        Pool: userPool,
    }

    const cognitoUser = new CognitoUser(userData)

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      console.log(result)
      if (err) {
        setError(err.message || JSON.stringify(err))
          return
      }
      setError('Email confirmed successfully!')

      setTimeout(() => {
        navigateToLogin()
      }, 2000)
    })
  }

  function navigateToLogin() {
    if (typeof window !== "undefined") {
      window.location.href = '/login'
    }
  }

  useEffect(() => {
    setValid(email.length > 0 && password.length > 0 && password === repeatPassword)
  }, [email, password, repeatPassword])

  const confirmView = (
    <div className={styles.container}>
      <a href="/login" className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">◷</span>
        <span>Chronos</span>
      </a>
      <h1 className={styles.title}>Confirm Email</h1>
      <p className={styles.subtitle}>Please check your email for the confirmation code</p>
      <label className={styles.fieldGroup}>
        Confirmation code
        <input
          className={styles.field}
          type="text"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your code"
        />
      </label>
      <button className={styles.button} onClick={handleConfirm}>Confirm</button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  )

  const signUpView = (
    <form className={styles.container} onSubmit={handleSignUp}>
      <a href="/login" className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">◷</span>
        <span>Chronos</span>
      </a>
      <h1 className={styles.title}>Sign Up</h1>
      <p className={styles.subtitle}>Create an account to start tracking your time.</p>
      <label className={styles.fieldGroup}>
        Email
        <input
          className={styles.field}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <label className={styles.fieldGroup}>
        Password
        <input
          className={styles.field}
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
        />
      </label>
      <label className={styles.fieldGroup}>
        Repeat password
        <input
          className={styles.field}
          type="password"
          autoComplete="new-password"
          required
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          placeholder="Repeat your password"
        />
      </label>
      <button className={styles.button} type="submit" disabled={!valid}>Sign Up</button>
      {error ? <p className={styles.error}>{error}</p> : null}
      <Link className={styles.link} href="/login">Already have an account? Log in</Link>
    </form>
  )

  return (
    <div className={styles.background}>
      {confirm ? confirmView : signUpView}
    </div>
  )
}

export default SignupView
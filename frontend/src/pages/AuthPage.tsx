import { BrainCircuit } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, signup } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const authenticate = useAuthStore((state) => state.authenticate)
  const navigate = useNavigate()
  const isLogin = mode === 'login'

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const response = await (isLogin ? login(email, password) : signup(email, password))
      authenticate(response)
      navigate('/')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-context">
        <div className="auth-brand"><span className="brand-mark"><BrainCircuit size={20} /></span>Recall</div>
        <div className="auth-copy"><span className="eyebrow">Your sources, in conversation</span><h1>Answers are better when they remember the evidence.</h1><p>Turn the documents you already trust into a private, searchable knowledge workspace.</p></div>
        <div className="auth-proof"><span>01</span><p>Upload your working knowledge</p><span>02</span><p>Ask in natural language</p><span>03</span><p>Trace every answer to its source</p></div>
      </section>
      <section className="auth-form-panel">
        <form className="auth-form" onSubmit={submit}>
          <div><span className="eyebrow">{isLogin ? 'Welcome back' : 'Create your account'}</span><h2>{isLogin ? 'Sign in to Recall' : 'Start building your memory'}</h2></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></label>
          <label>Password<input type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
          <button className="button primary wide" disabled={submitting}>{submitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}</button>
          <p className="auth-switch">{isLogin ? 'New to Recall?' : 'Already have an account?'} <Link to={isLogin ? '/signup' : '/login'}>{isLogin ? 'Create an account' : 'Sign in'}</Link></p>
        </form>
      </section>
    </main>
  )
}
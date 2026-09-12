import { BrainCircuit } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, signup } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

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
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2 lg:grid-cols-5 bg-background">
      <section className="relative hidden flex-col justify-between bg-primary/5 p-10 lg:p-14 md:flex lg:col-span-2 border-r border-border/50">
        <div className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-primary">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <BrainCircuit size={18} />
          </span>
          Recall
        </div>
        
        <div className="my-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Your sources, in conversation</span>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.15] text-foreground lg:text-5xl">
            Answers are better when they remember the evidence.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-sm">
            Turn the documents you already trust into a private, searchable knowledge workspace.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-serif text-sm font-semibold text-primary/40">01</span>
            <p className="text-sm font-medium text-muted-foreground">Upload your working knowledge</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-serif text-sm font-semibold text-primary/40">02</span>
            <p className="text-sm font-medium text-muted-foreground">Ask in natural language</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-serif text-sm font-semibold text-primary/40">03</span>
            <p className="text-sm font-medium text-muted-foreground">Trace every answer to its source</p>
          </div>
        </div>
      </section>
      
      <section className="flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 lg:col-span-3">
        <div className="md:hidden w-full max-w-sm flex items-center gap-2 font-serif text-xl font-semibold tracking-tight text-primary mb-12">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <BrainCircuit size={16} />
          </span>
          Recall
        </div>
        
        <form className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={submit}>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary text-left block mb-2">{isLogin ? 'Welcome back' : 'Create your account'}</span>
            <h2 className="font-serif text-3xl font-semibold tracking-tight">
              {isLogin ? 'Sign in to Recall' : 'Start building your memory'}
            </h2>
          </div>
          
          {error && (
            <div className="rounded-md border-l-4 border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-medium" role="alert">{error}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                autoComplete="email" 
                required 
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                placeholder="you@company.com" 
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                autoComplete={isLogin ? 'current-password' : 'new-password'} 
                minLength={8} 
                required 
                value={password} 
                onChange={(event) => setPassword(event.target.value)} 
                placeholder="At least 8 characters" 
                className="h-11"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full h-11 text-base font-medium" disabled={submitting}>
            {submitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? 'New to Recall?' : 'Already have an account?'} {' '}
            <Link to={isLogin ? '/signup' : '/login'} className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors">
              {isLogin ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}
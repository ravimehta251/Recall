import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
export function NotFoundPage() { return <main className="not-found"><span className="error-number">404</span><h1>This page slipped from memory.</h1><Link className="button primary" to="/"><ArrowLeft size={17} /> Return home</Link></main> }
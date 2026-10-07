import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-5xl px-10 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        This page does not exist in the demonstration environment.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Return to Command Centre</Link>
      </Button>
    </div>
  )
}

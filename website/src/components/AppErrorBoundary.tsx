import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught application error', error, info)
  }

  private reload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <section
          role="alert"
          aria-labelledby="app-error-title"
          className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0E4FA8]">Sanveda</p>
          <h1 id="app-error-title" className="mt-2 text-2xl font-bold text-[#041B4D]">
            Something went wrong
          </h1>
          <p className="mt-3 text-slate-600">
            The page could not be displayed. Reload to try again.
          </p>
          <button type="button" onClick={this.reload} className="btn-primary mt-6 px-5 py-3">
            Reload page
          </button>
        </section>
      </main>
    )
  }
}

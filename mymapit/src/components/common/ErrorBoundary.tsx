import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }

type State = { error: Error | null; info: ErrorInfo | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
    this.setState({ info })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-dvh bg-m-bg p-4 text-m-text">
          <h1 className="font-display text-lg font-semibold text-m-red">화면을 그리다 오류가 났어요</h1>
          <p className="mt-2 text-sm text-m-sub">
            새로고침 후에도 반복되면 아래 메시지를 복사해 주세요.
          </p>
          <pre className="mt-4 max-h-[50vh] overflow-auto rounded-xl bg-m-muted p-3 text-xs">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
            {this.state.info?.componentStack ?? ''}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

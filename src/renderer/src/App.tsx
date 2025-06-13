import { GmailProvider } from './hooks/GmailContext'
import MailWindow from './components/MailWindow'

function App(): React.JSX.Element {
  return (
    <GmailProvider>
      <MailWindow />
    </GmailProvider>
  )
}

export default App

import { UnansweredMailsProvider } from './hooks/UnansweredMailsContext'
import MailWindow from './components/MailWindow'

function App(): React.JSX.Element {

  return (
    <UnansweredMailsProvider>
      {/* <Chat /> */}
      <MailWindow />
    </UnansweredMailsProvider>
  )
}

export default App

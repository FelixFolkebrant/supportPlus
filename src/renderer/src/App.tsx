import Chat from './components/chat'

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <Chat />
    </>
  )
}

export default App

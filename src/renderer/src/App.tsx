import Chat from './components/chat'
import LastThree from './components/LastThree'


function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      {/* <Chat /> */}
      <LastThree />
    </>
  )
}

export default App

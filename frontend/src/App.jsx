import { useState } from 'react'
import Url from './components/url'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <a href="/"><h2 className='title'>Shortly</h2></a>  
      <Url />
    </>
  )
}

export default App

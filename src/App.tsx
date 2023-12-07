import React from 'react'
import styled from "styled-components"
import { BLACK, DARK_GREY } from "./constants"
import Input from "./components/input"
import Dropzone from './components/dropzone'
import Button from "./components/button"
import jszip from 'jszip'
import Fingerprint, {IFingerprintData,IProxy} from './components/fingerprint'
import { sendIpcMessage, trackIpcMessage } from './utils/utils'

function App() {

  const [token, setToken] = React.useState('')
  const [fingerprint, setFingerprint] = React.useState<IFingerprintData | null>(null)
  const [proxy, setProxy] = React.useState<IProxy | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const onDrop = async (file: File[]) => {
    const zip = new jszip();
    try {
      const content = await zip.loadAsync(file[0]);
      const e = content.file('fingerprint.json')
      if (e){
        e.async('string').then((data) => {
          setFingerprint(JSON.parse(data))
        })
      }
      const e2 = content.file('proxy.json')
      if (e2){
        e2.async('string').then((data) => {
          setProxy(JSON.parse(data))
        })
      }
    } catch (e){
      setError('Invalid file')
    }
  }

  const trackIpcMessage = (channel: string, listener: (...args: any[]) => void) => {
    const { electron } = window as any;
    if (electron){
        electron.on(channel, listener)
    } else {
        console.log('electron not available');
    }
}

  const handlePlaywrightAction = async () => {
    sendIpcMessage('googl', 'blabla')

    trackIpcMessage('googlreply', (event, data) => {
      console.log(data)
    })

  };

  const renderNewWindow = () => {
      return (
        <div style={{width: '50%', height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 10}}>
        <SectionTitle>TOKEN</SectionTitle>
        <Input 
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{width: '90%', marginLeft: '5%', fontSize: 13, color: BLACK, height: 35}}
          placeholder={'TABULA_SESSION_TOKEN....'}
        />
        {!fingerprint && !proxy && <SectionTitle style={{marginTop: 15, marginBottom: 7}}>FINGERPRINT</SectionTitle>}
        {!fingerprint && !proxy && <div style={{marginLeft: '5%', marginRight: '5%'}}>
          <Dropzone 
            accept={['application/zip']}
            onDrop={onDrop}
          />
        </div>} 
        {fingerprint && proxy && <div style={{marginLeft: '5%', marginRight: '5%', marginTop: 15}}><Fingerprint fingerprint={fingerprint} proxy={proxy} /></div>}
        <Button 
          color={'black'}
          title={'RUN'}
          disabled={!fingerprint || !proxy || !token}
          onClick={handlePlaywrightAction}
          style={{width: '90%', marginLeft: '5%', marginTop: 25, height: 35}}
        />
        <span style={{color: 'red', fontSize: 12, marginTop: 10, marginLeft: '5%'}}>{error}</span>
      </div>
      )
  }

  return (
      <div style={{display: 'flex', flexDirection: 'column', height: window.innerHeight, width: window.innerWidth}}>
        <div style={{display:'flex', flexDirection: 'row', height: '50%', width: '100%'}}>
          {renderNewWindow()}
          <div style={{width: '50%', height: '100%', backgroundColor: '#111111'}}/>
        </div>
        <div style={{display:'flex', flexDirection: 'row', height: '50%', width: '100%'}}>
          <div style={{width: '50%', height: '100%', backgroundColor: '#333333'}}/>
          <div style={{width: '50%', height: '100%', backgroundColor: '#555555'}}/>
        </div>
        
      </div>
  )
}

const SectionTitle = styled.span`
    font-size: 11px;
    color: ${DARK_GREY};
    font-family: 'Roboto', sans-serif;
    margin-bottom: 5px;
    margin-left: 5%;
`


export default App

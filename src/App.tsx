import React from 'react'
import styled from "styled-components"
import { BLACK, DARK_GREY } from "./constants"
import Input from "./components/input"
import Dropzone from './components/dropzone'
import Button from "./components/button"
import jszip from 'jszip'
import Fingerprint  from './components/fingerprint'
import { sendIpcMessage, trackIpcMessage } from './utils/utils'
import { IFingerprintData, IProxy } from './types'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

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

  const handlePlaywrightAction = async () => {
    
    sendIpcMessage('runvb', {
      context: token,
      fingerprint,
      proxy
    })

    trackIpcMessage('runvbreply', (event, data) => {
      console.log(data)
    })
  };

  const renderNewWindow = () => {
      return (
        <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 10}}>
          <Title>VIRTUAL BROWSER</Title>

        <div style={{display: 'flex', flexDirection: 'row', marginLeft: '5%', marginRight: '5%', marginBottom: 7, justifyContent: 'space-between'}}>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <img src={'/images/blue-key.png'} style={{width: 14, height: 14, marginRight: 4}} />
            <SectionTitle>TOKEN (optional)</SectionTitle>
          </div>
          <Popup 
            trigger={<img src={'images/question.png'} style={{width:17, height: 17}} />}
            position={'bottom center'}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <img src={'/images/copy-token-screen.png'} style={{width: '100%'}} />
                <InfoText>If you have a user's token yet you can copy it from your Tabula dashboard, if not leave the input empty to scrap it.</InfoText>
              </div>
            </Popup>
        </div>
        <Input 
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{width: '90%', marginLeft: '5%', fontSize: 13, color: BLACK, height: 35}}
          placeholder={'TABULA_SESSION_TOKEN....'}
        />
        {!fingerprint && !proxy && (
          <div style={{marginLeft: '5%',marginRight: '5%', marginTop: 20, marginBottom: 7, display: 'flex', flexDirection: 'row', alignItems: 'center',justifyContent: 'space-between'}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <img src={'/images/apple.png'} style={{width: 12, height: 12, marginRight: 3}} />
              <img src={'/images/windows.png'} style={{width: 12, height: 12, marginRight: 3}} />
              <img src={'/images/linux.png'} style={{width: 12, height: 12, marginRight: 3}} />
              <SectionTitle>FINGERPRINT</SectionTitle>
            </div>
            <Popup 
            trigger={<img src={'images/question.png'} style={{width:17, height: 17}} />}
            position={'bottom center'}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <img src={'/images/download-fp-screen.png'} style={{width: '100%'}} />
                <InfoText>Download your fingerprint from your dashboard and drag it here.</InfoText>
              </div>
            </Popup>
          </div>
        )}
        {!fingerprint && !proxy && <div style={{marginLeft: '5%', marginRight: '5%'}}>
          <Dropzone 
            accept={['application/zip']}
            onDrop={onDrop}
          />
        </div>} 
        {fingerprint && proxy && <div style={{marginLeft: '5%', marginRight: '5%', marginTop: 15}}><Fingerprint fingerprint={fingerprint} proxy={proxy} /></div>}
        <Button 
          color={'black'}
          icon='images/chrome.png'
          iconStyle={{width: 18, height: 18, marginRight: 7}}
          title={'START CHROME'}
          disabled={!fingerprint || !proxy}
          onClick={handlePlaywrightAction}
          textStyle={{fontSize: 12}}
          style={{width: '90%', marginLeft: '5%', marginTop: 25, height: 35}}
        />
        <span style={{color: 'red', fontSize: 12, marginTop: 10, marginLeft: '5%'}}>{error}</span>
      </div>
      )
  }

  return (
      <div style={{display: 'flex', flexDirection: 'row', height: window.innerHeight, width: window.innerWidth}}>
        <div style={{display:'flex', flexDirection: 'column', width: '50%', height: '100%'}}>
          {renderNewWindow()}
          {/* <div style={{height: '50%', width: '100%', backgroundColor: '#111111'}}/> */}
        </div>
        <div style={{display:'flex', flexDirection: 'column', width: '50%', height: '100%'}}>
          <div style={{height: '50%', width: '100%', backgroundColor: '#333333'}}/>
          <div style={{height: '50%', width: '100%', backgroundColor: '#555555'}}/>
        </div>
        
      </div>
  )
}

const Title = styled.span`
    font-size: 14px;
    color: ${BLACK};
    font-weight: 600;
    text-align: center;
    font-family: 'Roboto', sans-serif;
    margin-left: 7px;
    margin-top: 15px;
    margin-bottom: 25px;
`  

const SectionTitle = styled.span`
    font-size: 12px;
    color: ${DARK_GREY};
    font-family: 'Roboto', sans-serif;
`

const InfoText = styled.span`
  font-size: 15px;
  color: ${BLACK};
  font-family: 'Roboto', sans-serif;
  padding: 7px;
`


export default App

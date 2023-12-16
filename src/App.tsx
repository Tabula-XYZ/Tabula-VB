import React, { useEffect, useRef } from 'react'
import styled from "styled-components"
import { BLACK, DARK_GREY, showAlertMessage } from "./constants"
import Input from "./components/input"
import Dropzone from './components/dropzone'
import Button from "./components/button"
import jszip from 'jszip'
import Fingerprint  from './components/fingerprint'
import { copyToClipboard, sendIpcMessage, trackIpcMessage } from './utils/utils'
import { IFingerprintData, IProxy } from './types'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import DropdownAlert from './components/dropdown'
import { IBrowserState } from './types2'

const SEC_BEFORE_REFRESH = 30
let browserStateFetchingCount = 0

const storedfingerprint = localStorage.getItem('fingerprint')
const storedproxy = localStorage.getItem('proxy')

function App() {
  const dropdownRef = useRef<DropdownAlert>(null);
  const [token, setToken] = React.useState('')
  const [ loading, setLoading ] = React.useState(false)

  const [fingerprint, setFingerprint] = React.useState<IFingerprintData | null>(storedfingerprint ? JSON.parse(storedfingerprint) : null)
  const [proxy, setProxy] = React.useState<IProxy | null>(storedproxy ? JSON.parse(storedproxy) : null)
  const [error, setError] = React.useState<string | null>(null)
  const [chromePath,setChromePath] = React.useState<string | null>(localStorage.getItem('chrome_path'))
  const [secBeforeRefresh, setSecBeforeRefresh] = React.useState(SEC_BEFORE_REFRESH)
  
  const [browserState, setBrowserState] = React.useState<null | IBrowserState>(null)

  useEffect(() => {
    // Exit early when we reach 0
    if (!secBeforeRefresh) {
        // Trigger your action here
        browserState && fetchBrowserState()
        // Reset countdown
        setSecBeforeRefresh(SEC_BEFORE_REFRESH);
        return;
    }

    // Save intervalId to clear the interval when the component unmounts
    const intervalId = setInterval(() => {
      setSecBeforeRefresh(secBeforeRefresh - 1);
    }, 1000)

    return () => clearInterval(intervalId)
}, [secBeforeRefresh]);


  const onClickCopyToken = (token: string) => {
    copyToClipboard(token)
    showAlertMessage(dropdownRef).info('Token copied to clipboard')
  }

  const onClickURL = (url: string) => {
    copyToClipboard(url)
    showAlertMessage(dropdownRef).info('URL copied to clipboard')
  }

  useEffect(() => {

    trackIpcMessage('runvbreply', (event, data) => {
      if (event){
        const { error }  =  data
        error && setError(error)
        setLoading(false)
        fetchBrowserState()
      }
    })

    trackIpcMessage('getvbstatereply', (event, data) => {
      browserStateFetchingCount -= 1
      try {
        if (event){
          const state = data.state as IBrowserState
          setBrowserState(state)
          state.chrome_path && localStorage.setItem('chrome_path', state.chrome_path)
          state.fingerprint && localStorage.setItem('fingerprint', JSON.stringify(state.fingerprint))
          state.proxy && localStorage.setItem('proxy', JSON.stringify(state.proxy))
          setSecBeforeRefresh(SEC_BEFORE_REFRESH)
        }
      } catch (e){
        console.log(e)
      }
    })

    trackIpcMessage('closevbreply', () => {
      setBrowserState(null)
      setLoading(false)
      setSecBeforeRefresh(SEC_BEFORE_REFRESH)
    })

    trackIpcMessage('getpathreply', (event, data) => {
      if (event && data && data.path){
        setChromePathMiddleware(data.path)
      }
    })

    !chromePath && fetchChromePath()
  }, [])

  useEffect(() => {
    setError(null)
  }, [fingerprint, token])

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

  const setChromePathMiddleware = (path: string) => {
    setChromePath(path)
  }

  const closeBrowser = () => {
    sendIpcMessage('closevb', {})
  }

  const fetchBrowserState = () => {
    if (browserStateFetchingCount === 0){
      browserStateFetchingCount += 1
      sendIpcMessage('getvbstate', {})
    }
  }

  const fetchChromePath = () => {
    sendIpcMessage('getpath', {})
  }

  const handlePlaywrightAction = async () => {
    setLoading(true)
    if (!loading){
      sendIpcMessage('runvb', {
        context: token,
        fingerprint,
        proxy,
        path: chromePath
      })
    }
  };

  const reset = () => {
    setFingerprint(null)
    setProxy(null)
    setToken('')
    setError(null)
    localStorage.removeItem('fingerprint')
    localStorage.removeItem('proxy')
    
    closeBrowser()

  }

  const renderNewWindow = () => {

    const renderBrowserStateView = () => {
      if (!browserState) 
        return null
      
      const { context_base64, current_url } = browserState
      return (
        <div style={{width: '90%', height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 20, paddingLeft: '5%', paddingRight: '5%'}}>
          <Title>VIRTUAL BROWSER <span style={{fontSize: 10.5, color: DARK_GREY}}><br />(data re-calculated in <span style={{color: BLACK, fontSize: 11.5}}>{secBeforeRefresh}s</span>)</span></Title>

          {fingerprint && proxy && <div style={{marginTop: 15}}><Fingerprint fingerprint={fingerprint} proxy={proxy} /></div>}
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 5}}>
            <SectionTitle>CURRENT PAGE</SectionTitle>
          </div>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Input value={current_url} disabled={true}  />
            <img onClick={() => onClickURL(current_url)}  style={{width: 20, height: 20, paddingLeft: '5%', cursor: 'pointer'}} src={'images/copy-blue.png'} />
          </div>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 5}}>
            <img src={'images/blue-key.png'} style={{width: 14, height: 14, marginRight: 4}} />
            <SectionTitle>CURRENT TOKEN</SectionTitle>
          </div>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Input value={context_base64} disabled={true}  />
            <img onClick={() => onClickCopyToken(context_base64)}  style={{width: 20, height: 20, paddingLeft: '5%', cursor: 'pointer'}} src={'images/copy-blue.png'} />
          </div>
          <Button 
            color={'red'}
            loading={loading}
            icon='images/chrome.png'
            iconStyle={{width: 18, height: 18, marginRight: 7}}
            title={'CLOSE VIRTUAL BROWSER'}
            onClick={() => {
              closeBrowser()
              setLoading(true)
            }}
            textStyle={{fontSize: 12}}
            style={{width: '100%', marginTop: 25, height: 35}}
          />
        </div>
      )

    }

    if (browserState){
      return renderBrowserStateView()
    }

      return (
        <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 10}}>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%', marginLeft: '5%', marginTop: 20, marginBottom: 35}}>
            <div />
            <Title>VIRTUAL BROWSER</Title>
            <div onClick={reset}><img style={{width: 14, height: 14,cursor: 'pointer'}} src={'images/undo-arrow-black.png'}/></div>
          </div>

        <div style={{display: 'flex', flexDirection: 'row', marginLeft: '5%', marginRight: '5%', marginBottom: 7, justifyContent: 'space-between'}}>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <img src={'images/blue-key.png'} style={{width: 14, height: 14, marginRight: 4}} />
            <SectionTitle>TOKEN (optional)</SectionTitle>
          </div>
          <Popup 
            trigger={<img src={'images/question.png'} style={{width:17, height: 17, cursor: 'pointer'}} />}
            position={'left top'}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <img src={'images/copy-token-screen.png'} style={{width: '100%'}} />
                <InfoText>If you want to interact with a social media account used on Tabula, you can copy it from your Tabula dashboard.<br/><br />If not leave the input empty.</InfoText>
              </div>
            </Popup>
        </div>
        <Input 
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={loading}
          style={{width: '90%', marginLeft: '5%', fontSize: 13, color: BLACK, height: 35}}
          placeholder={'TABULA_SESSION_TOKEN....'}
        />
        {!fingerprint && !proxy && (
          <div style={{marginLeft: '5%',marginRight: '5%', marginTop: 20, marginBottom: 7, display: 'flex', flexDirection: 'row', alignItems: 'center',justifyContent: 'space-between'}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <img src={'images/apple.png'} style={{width: 12, height: 12, marginRight: 3}} />
              <img src={'images/windows.png'} style={{width: 12, height: 12, marginRight: 3}} />
              <img src={'images/linux.png'} style={{width: 12, height: 12, marginRight: 3}} />
              <SectionTitle>FINGERPRINT</SectionTitle>
            </div>
            <Popup 
            trigger={<img src={'images/question.png'} style={{width:17, height: 17, cursor: 'pointer'}} />}
            position={'left top'}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <img src={'images/download-fp-screen.png'} style={{width: '100%'}} />
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
        {fingerprint && <SectionTitle style={{marginTop:25, marginLeft: '5%', fontSize: 10.5}}>GOOGLE CHROME PATH</SectionTitle>}
        {fingerprint && <Input 
          value={chromePath || ''}
          style={{width: '90%', marginLeft: '5%', fontSize: 11, color: BLACK, height: 25, marginTop: 5}}
          onChange={(e) => setChromePathMiddleware(e.target.value)}
        />}
        <Button 
          color={'black'}
          icon='images/chrome.png'
          iconStyle={{width: 18, height: 18, marginRight: 7}}
          title={'START CHROME'}
          disabled={!fingerprint || !proxy}
          onClick={() => handlePlaywrightAction()}
          loading={loading}
          textStyle={{fontSize: 12}}
          style={{width: '90%', marginLeft: '5%', marginTop: fingerprint ? 10: 25, height: 35}}
        />
        <span style={{color: 'red', fontSize: 12, marginTop: 10, marginLeft: '5%'}}>{error}</span>
      </div>
      )
  }

  return (
      <div style={{display: 'flex', flexDirection: 'row', height: window.innerHeight, width: window.innerWidth}}>
        <div style={{display:'flex', flexDirection: 'column', width: '100%', height: '100%'}}>
          {renderNewWindow()}
        </div>
        <DropdownAlert ref={dropdownRef} />
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
`  

const SectionTitle = styled.span`
    font-size: 12px;
    color: ${DARK_GREY};
    font-family: 'Roboto', sans-serif;
`

const InfoText = styled.span`
  font-size: 13px;
  color: ${BLACK};
  font-family: 'Roboto', sans-serif;
  padding: 7px;
`


export default App

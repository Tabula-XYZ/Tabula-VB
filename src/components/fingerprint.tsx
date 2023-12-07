import React, { useEffect, useState } from "react";
import moment from "moment";
import _ from 'lodash'
import styled from "styled-components";
import { BLACK, BLUE_NAVY, CLEAR_BLACK, DARK_GREEN, DARK_GREY, GOLD, GREEN, RED, WHITE_GREY } from "../constants";
import * as Flags from "react-flags-select";
import axios, { AxiosRequestConfig } from "axios";
import Loading from "./loader";
import Link from "./link";

export interface IProxy {
    ip: string
    port: number
    username: string
    password: string
  }
  
  
  export interface IFingerprintData {
    fingerprint: {
      screen: {
        availHeight: number;
        availWidth: number;
        pixelDepth: number;
        height: number;
        width: number;
        availTop: number;
        availLeft: number;
        colorDepth: number;
        innerHeight: number;
        outerHeight: number;
        outerWidth: number;
        innerWidth: number;
        screenX: number;
        pageXOffset: number;
        pageYOffset: number;
        devicePixelRatio: number;
        clientWidth: number;
        clientHeight: number;
        hasHDR: boolean;
      };
      navigator: {
        userAgent: string;
        userAgentData: any;
        language: string;
        languages: string[];
        platform: string;
        deviceMemory: number;
        hardwareConcurrency: number;
        maxTouchPoints: number;
        product: string;
        productSub: string;
        vendor: string;
        vendorSub: string | null;
        doNotTrack: string | null;
        appCodeName: string;
        appName: string;
        appVersion: string;
        oscpu: string | null;
        extraProperties: any;
        webdriver: boolean;
      };
      audioCodecs: {
        ogg: string;
        mp3: string;
        wav: string;
        m4a: string;
        aac: string;
      };
      videoCodecs: {
        ogg: string;
        h264: string;
        webm: string;
      };
      pluginsData: {
        plugins: any[];
        mimeTypes: any[];
      };
      battery: {
        charging: boolean;
        chargingTime: number;
        dischargingTime: number | null;
        level: number;
      };
      videoCard: {
        vendor: string;
        renderer: string;
      };
      multimediaDevices: {
        speakers: any[];
        micros: any[];
        webcams: any[];
      };
      fonts: string[];
    };
    headers: {
      'sec-ch-ua': string;
      'sec-ch-ua-mobile': string;
      'sec-ch-ua-platform': string;
      'upgrade-insecure-requests': string;
      'user-agent': string;
      accept: string;
      'sec-fetch-site': string;
      'sec-fetch-mode': string;
      'sec-fetch-user': string;
      'sec-fetch-dest': string;
      'accept-encoding': string;
      'accept-language': string;
    };
  }

  interface GeoLocation {
    ip: string;
    network: string;
    version: string;
    city: string;
    region: string;
    region_code: string;
    country: string;
    country_name: string;
    country_code: string;
    country_code_iso3: string;
    country_capital: string;
    country_tld: string;
    continent_code: string;
    in_eu: boolean;
    postal: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    currency_name: string;
    languages: string;
    country_area: number;
    country_population: number;
    asn: string;
    org: string;
  }

const Cell = (props: IProps) => {

    const { fingerprint, proxy } = props
    const [ geo, setGeo] = useState<GeoLocation | null>(null)
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        setLoading(true)
        getIPLocation(proxy.ip).then((geo) => {
            if (typeof geo === 'string'){

            } else{
                setGeo(geo)
            }
            setLoading(false)
        })
    }, [])



    const getIPLocation = async (ipAddress: string) => {
        try {
          const options: AxiosRequestConfig = {
            url: `https://ipapi.co/${ipAddress}/json/`,
            method: 'GET',
            headers: { 'User-Agent': 'nodejs-ipapi-v1.02' },
            timeout: 5_000
          };
          const response = await axios(options);
          if (response.status >= 200 && response.status < 300) {
            return response.data as GeoLocation;
          } else {
            return 'unable to fetch ip'
          }
        } catch (error) {
          return 'unable to fetch ip'
        }
      }


    const renderTitle = () => {
        if (!fingerprint) 
            return (
                <div style={{marginBottom: 5}}>
                    <span style={{fontSize: 10, color: DARK_GREY, fontWeight: 600, marginRight: 7}}>{'NEW FINGERPRINT:'}</span>
                </div>
            )
        const f = fingerprint
        
        const platform = f.fingerprint.navigator.userAgentData.platform
        const version = f.fingerprint.navigator.userAgentData.platformVersion
        let icon = '/images/linux.png'
        if (platform.toLowerCase().includes('windows')){
            icon = '/images/windows.png'
        } else if (platform.toLowerCase().includes('mac')){
            icon = '/images/apple.png'
        }

        return (
            <div style={{width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5}}>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <img src={icon} style={{ width: 12, height: 12, marginBottom: 0}} />
                    <Platform>{platform} {version}</Platform>                    
                </div>
            </div>
        )
    }

    const renderCell = () => {
        const f = fingerprint

        let date: string | null = null
        if (geo){
            const options = { timeZone: geo.timezone };
            date = new Date().toLocaleString('en-US', options);
        }
        const code = geo ? _.capitalize(geo.country_code.toLowerCase()) : 'Us'
        const Compo = (Flags as any)[code]

        return (
            <Container>
                {renderTitle()}
                <ProxyCell>
                    <ProxyInfo style={{width: '100%'}}>
                        <ProxyHeader>
                            <ProxyDetails>
                                {geo && <Compo style={{width: 46, height: 46}} />}
                                <ProxyDescription>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <ProxyIp>{proxy.ip}</ProxyIp>
                                    {geo && <ProxyOrg>({geo.org})</ProxyOrg>}
                                    </div>
                                    {geo && <ProxyLocation>{geo.city}, {geo.country_name}</ProxyLocation>}
                                </ProxyDescription>
                            </ProxyDetails>
                            {date && <ProxyTime>{moment(date).format('LT')}</ProxyTime>}
                        </ProxyHeader>
                    </ProxyInfo>
                </ProxyCell>
            </Container>
        )
    }

    if (loading){
        return (
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 5}}>
                <Loading size={20} />
            </div>
        )
    }

    if (!loading && !geo){
        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20}}>
                <UnableToFetch>UNABLE TO FETCH IP LOCATION</UnableToFetch>
                <Link onClick={props.onCancel}>Cancel</Link>
            </div>
        )
    }

    return renderCell()

}

interface IProps {
    proxy: IProxy
    fingerprint: IFingerprintData
    onCancel?: () => void
}


const Container = styled.div`
    
`

const ProxyCell = styled.div<any>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: relative;
    
    .rm-proxy {
        background-color: ${RED};
    }

    .update-proxy {
        background-color: ${BLUE_NAVY};
    }

    .dl-proxy {
        background-color: ${DARK_GREEN};
    }

    .action-proxy {
        cursor: pointer;
        transition: transform .2s; /* Animation */
        cursor: ${props => props.isLoading ? 'not-allowed' : 'pointer'};
        width: 24px;
        height: 24px;
        border-radius: 4px;
        display: flex;
        align-items:center;
        justify-content: center;
        :hover {
            transform: ${props => props.isLoading ? 'scale(1.15);' : 'scale(1.2)'};
        }
    }
`
const ProxyInfo = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${WHITE_GREY};
  padding-bottom: 5px;
`;

const ProxyHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 5px;
`;

const ProxyDetails = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 15px;
`;


const ProxyDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 15px;
`;

const ProxyIp = styled.span`
  font-size: 13px;
  color: ${BLACK};
  font-weight: 700;
  font-family: 'Roboto', sans-serif;
`;

const ProxyOrg = styled.span`
  font-size: 10px;
  color: ${DARK_GREY};
  font-weight: 400;
  margin-left: 5px;
  font-family: 'Roboto', sans-serif;
`;

const ProxyLocation = styled.span`
  font-size: 11px;
  color: ${CLEAR_BLACK};
  font-weight: 600;
  margin-top: 4px;
  font-family: 'Roboto', sans-serif;
`;

const ProxyTime = styled.span`
  font-size: 10px;
  color: ${DARK_GREY};
  margin-right: 10px;
  margin-top: 7px;
  font-family: 'Roboto', sans-serif;
`;

const Platform = styled.span`
    font-size: 12px;
    color: ${BLACK};
    font-weight: 600;
    margin-left: 5px;
    font-family: 'Roboto', sans-serif;
`

const UnableToFetch = styled.span`
    font-size: 10px;
    color: ${DARK_GREY};
    font-family: 'Roboto', sans-serif;
    margin-bottom: 5px;

`


export default Cell
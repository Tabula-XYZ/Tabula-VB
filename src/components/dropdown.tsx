import React from "react";
import styled from 'styled-components'
import _ from 'lodash'
import { BLUE, DARK_GREY, FLASHY_GREEN, GOLD, RED } from "../constants";

type T_MSG = 'success' | 'error' | 'error-light' | 'info-light' | 'info-strong'

const colors = [
    {
        type: 'error',
        color: RED,
    },
    {
        type: 'error-light',
        color: GOLD,
    },
    {
        type: 'info-light',
        color: BLUE
    },
    {
        type: 'info-strong',
        color: DARK_GREY
    },
    {
        type: 'success',
        color: FLASHY_GREEN
    }
]

class DropdownAlert extends React.Component {

    private _timeout: any = null
    private _stoptimeout: any = null

    state = {
        type: 'success',
        className: '',
        actived: false,
        text: ''
    }

    Active = (type: T_MSG, text: string) => {
        clearTimeout(this._stoptimeout)
        if (this.state.actived === true){
            clearTimeout(this._timeout)
            // this.Stop()
            // return
        }
        this.setState({type, className: type === 'success' ? "appear-dropdown-alert-success" : 'appear-dropdown-alert', actived: true, text})
        let ms = 2000
        if (type !== 'success'){
            ms = 4000
        }
        this._timeout = setTimeout(() => this.Stop(), ms)
    }

    Stop = () => {
        const { type } = this.state
        if (this.state.actived === false){
            return
        }
        this.setState({className: type === 'success' ? "disappear-dropdown-alert-success" : 'disappear-dropdown-alert', text: ''})
        this._stoptimeout = setTimeout(() => this.setState({actived: false}), 200)
    }

    render(){
        const { type , actived, className, text } = this.state
        if (!actived)
            return null

        const o = _.find(colors, {type})
        return (
            <Container>
                <div className={"dropdown-alert " + className} style={{backgroundColor: o?.color, height: type === 'success' ? 10 : 20}}>
                    <span className="dropdown-alert-text">{text}</span>
                </div>
            </Container>
        )
    }
}


const Container = styled.div`
    .dropdown-alert {
        position: fixed;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        top: 0;
        left: 0;
        width: 100%;

        .dropdown-alert-text {
            color: white;
            font-size: 11px;
        }
    }

    @keyframes appearDropdownAlertSuccess {
        0% {
            transform: translateY(-11px);
        }
        100% {
            transform: translateY(0px);
        }
    }
    
    .appear-dropdown-alert-success {
        animation-name: appearDropdownAlertSuccess;
        animation-timing-function: linear;
        animation-duration: 0.2s;
        animation-fill-mode: forwards;
    }

    @keyframes disappearDropdownAlertSuccess {
        0% {
            transform: translateY(0px);
        }
        100% {
            transform: translateY(-11px);
        }
    }

    .disappear-dropdown-alert {
        animation-name: disappearDropdownAlertSuccess;
        animation-timing-function: linear;
        animation-duration: 0.2s;
        animation-fill-mode: forwards;
    }

    @keyframes appearDropdownAlert {
        0% {
            transform: translateY(-21px);
        }
        100% {
            transform: translateY(0px);
        }
    }
    
    .appear-dropdown-alert {
        animation-name: appearDropdownAlert;
        animation-timing-function: linear;
        animation-duration: 0.2s;
        animation-fill-mode: forwards;
    }

    @keyframes disappearDropdownAlert{
        0% {
            transform: translateY(0px);
        }
        100% {
            transform: translateY(-21px);
        }
    }

    .disappear-dropdown-alert-success {
        animation-name: disappearDropdownAlert;
        animation-timing-function: linear;
        animation-duration: 0.2s;
        animation-fill-mode: forwards;
    }
`


export default DropdownAlert;

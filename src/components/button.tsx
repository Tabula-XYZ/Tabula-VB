import styled from 'styled-components'
import { TinyColor } from '@ctrl/tinycolor';
import { BLACK, BLUE, DARK_GREY, FLASHY_GREEN, RED, WHITE_GREY } from '../constants';

import Loading from './loader';

const colors = {
    white: 'white',
    green: FLASHY_GREEN,
    blue: BLUE,
    black: BLACK,
    red: RED,
    'twitter-blue': '#1DA1F2',
    'facebook-blue': '#4267B2',

}

const textColor = {
    white: DARK_GREY,
    green: `white`,
    blue: `white`,
    black: `white`,
    red: 'white',
    'twitter-blue': `white`,
    'facebook-blue': `white`,
}

const Button = (props: IProps) => (
    <Btn style={props.style} disabled={props.disabled || !!props.loading} color={props.color} loading={props.loading ? 1 : 0} onClick={props.onClick}>
        {!props.loading && props.icon && <img style={Object.assign(props.iconStyle || {})} src={props.icon} />}
        {!props.loading && <span style={props.textStyle}>{props.title}</span>}
        {props.loading && <Loading size={14} white={props.color != 'white'} />}
    </Btn>
)

interface IProps {
    color: 'white' | 'green' | 'blue' | 'black' | 'red' | 'twitter-blue' | 'facebook-blue'
    title: string
    disabled?: boolean
    icon?: string
    onClick?: any
    loading?: boolean
    textStyle?: any
    iconStyle?: any
    style?:any
}

interface IBtn {
    color: 'white' | 'green' | 'blue' | 'black' | 'red' | 'twitter-blue' | 'facebook-blue'
    loading?: number
}

const Btn = styled.button<IBtn>`
    cursor: ${props => !props.disabled ? 'pointer' : 'not-allowed'};
    width: 100%;
    height: 100%;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    align-items:center;
    justify-content: center;
    background-color: ${props => !props.disabled ? colors[props.color] : (props.color != 'white' ? new TinyColor(colors[props.color]).lighten(10).toHexString() : new TinyColor(colors[props.color]).darken(10).toHexString()) };
    border: ${props => props.color === 'white' ? `1px solid ${WHITE_GREY}` : 'none'};
    
    span {
        color: ${props => textColor[props.color]};
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 0.5px;
    }

    :hover {
        background-color: ${props => !props.disabled ? new TinyColor(colors[props.color]).darken(10).toHexString() : undefined};
    }

`
export default Button
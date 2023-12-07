import styled from 'styled-components'
import { BLACK, DARK_GREY, WHITE_GREY } from '../constants'

const Input = styled.input`
    box-sizing: border-box;
    width: 100%;
    height: 30px;
    padding: 5px;
    border: 1px solid ${WHITE_GREY};
    ::placeholder {
        color: ${DARK_GREY}
    }
    border-radius: 5px;
    outline: none;
    font-size: 14px;
    color: ${BLACK};
`

export default Input
import styled from 'styled-components'
import { BLUE } from '../constants';

export default styled.button`
    padding: 0px;
    margin: 0px;
    font-size: 12px;
    border: none;
    background: transparent;
    outline: none;
    display:inline-block;
    text-decoration:none;
    cursor: pointer;
    color: ${BLUE};
    opacity: 0.85;
    font-weight:600;

    :hover {
        opacity: 1;
    }
`;

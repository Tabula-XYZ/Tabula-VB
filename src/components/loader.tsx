
const Loading = (props: IProps) => {

    const { size,white } = props
    return (
        <img src={`/anim/loading${white ?'-white' : ''}.svg`} alt={'loader'} style={Object.assign(props.style || {}, {width: size, height: size})} />
    )
}

interface IProps{
    size: number,
    style?: any
    white?: boolean
}

export default Loading
import DropdownAlert from "../components/dropdown"

export const showAlertMessage = (dropdownReactRef: React.RefObject<DropdownAlert>) => {

    const success = () => dropdownReactRef.current && dropdownReactRef.current.Active('success', '')
    const error = (e: string) => dropdownReactRef.current && dropdownReactRef.current.Active('error', e)
    const warning = (e: string) => dropdownReactRef.current && dropdownReactRef.current.Active('error-light', e)
    const info = (e: string) => {
        dropdownReactRef.current && dropdownReactRef.current.Active('info-light', e)
    }

    return {
        success,
        error,
        warning,
        info
    }
}
import React, {useId} from "react"
// import Select from 'react-select'
import Select from "react-select"

type Option = {
    label: string,
    value: string
}

type SelectNavProps = {
    onChange: (value: string) => void
    options: Option[],
    value?: string,
    defaultLabel: string,
    redOnActive?: boolean,
    classNames?: {
        control?: string,
        singleValue?: string,
        option?: string,
    }
}

const SelectNav: React.FC<SelectNavProps> = ({onChange, options, value, defaultLabel, classNames}) => {
    const instanceId = useId()
    const defaultValue = value ? options.filter(option => (value == option.value))[0] : {value: defaultLabel, label: defaultLabel}
    const emptyOption = {value: defaultLabel, label: defaultLabel}
    return (
        <>
            <Select instanceId={instanceId} value={defaultValue} defaultValue={emptyOption} options={[emptyOption, ...options]} isSearchable={false} onChange={
                (option) => {
                    if(option?.value == defaultLabel) {
                        onChange('')
                    } else {
                        onChange(option?.value ? option.value : '')
                    }
                }
            }
            styles={{
                control: (style, state) => {
                    return {...style, borderRadius: '0', border: 0, borderBottom: state.getValue()[0].value == defaultLabel ? '1px solid var(--color-front-navy)' : '1px solid var(--color-front-navy)'}
                },
                menu: style => {
                    return {...style, borderRadius: 0}
                },
                option: (style, {isSelected}) => {
                    if(isSelected) {
                        return {...style, backgroundColor: 'var(--color-front-navy)', color: 'var(--color-front-icewhite)'}
                    }
                    return {...style, color: 'var(--color-front-navy)'}
                },
                singleValue: (style) => {
                    return {...style, color: 'var(--color-front-navy)'}
                },
                dropdownIndicator: (style) => {
                    return {...style, fill: 'var(--color-front-navy)'}
                },
            }}

            classNames={{
                control: () => {
                    const className = classNames?.control || ''
                    return className + ' bg-white'
                },
                singleValue: () => {
                    const className =classNames?.singleValue || ''
                    return className + ' text-black text-front-body-big'
                },
                indicatorSeparator: () => 'hidden',
                dropdownIndicator: () => {
                    // if (state.getValue()[0].value == defaultLabel) return '!text-front-black-grey'
                    return '!text-front-red'
                },
                option: () => {
                    const className = classNames?.option || ''
                    return className + ' hover:!bg-front-red hover:!text-white active:!bg-front-red active:!text-white'
                }
            }}
            />
        </>
    )
}

export default SelectNav
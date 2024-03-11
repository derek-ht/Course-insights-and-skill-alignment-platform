import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

const FormMobileInput = ({ id, label, name, form, placeholder, type, onBlur } : {
  id: string,
  label: string,
  name: string,
  placeholder?: string,
  form: any,
  type?: string,
  onBlur?: CallableFunction
}) => {
  const onNumberChange = (e: any, field: any) => {
    e.target.value = e.target.value.replace(/\D/,'');
    form.setValue(field.name, e.target.value)
  }
  return (
    <>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl
               onKeyDown={(e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault())}
               onChange={e => onNumberChange(e, field)}
               onBlur={() => onBlur && onBlur()}
            >
              <Input
                id={id}
                placeholder={placeholder}
                type={type}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

export default FormMobileInput;
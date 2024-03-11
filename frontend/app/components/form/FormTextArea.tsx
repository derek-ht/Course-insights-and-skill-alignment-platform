import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Textarea } from '../ui/textarea'

const FormTextArea = ({ id, label, name, placeholder, control, onBlur } : {
  id: string,
  label: string,
  name: string,
  placeholder: string,
  control: any
  onBlur? : () => void
}) => {
  return (
    <>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl
              onBlur={() => onBlur && onBlur()}
            >
            <Textarea
              id={id}
              className="resize-none"
              placeholder={placeholder}
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

export default FormTextArea
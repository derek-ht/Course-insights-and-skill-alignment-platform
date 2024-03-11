import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Select, SelectContent, SelectTrigger, SelectValue } from '../ui/select'

const FormSelect = ({ id, label, name, form, placeholder, selectContent, onChange }: {
  id: string,
  label: string,
  name: string,
  placeholder?: string,
  form: any,
  selectContent: React.ReactElement[],
  onChange: () => void
}) => {
  return (
    <>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Select
                onValueChange={(value: string) => {
                  field.onChange(value);
                  onChange();
                }}
                required={false}
                defaultValue={field.value}
              >
                <SelectTrigger className="max-w">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {selectContent}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

export default FormSelect;
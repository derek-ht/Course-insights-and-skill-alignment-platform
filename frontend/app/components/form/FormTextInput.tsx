import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
const FormTextInput = ({
  id,
  label,
  name,
  control,
  placeholder,
  type,
  accept,
  onBlur,
  onKeyDown,
  disabled,
}: {
  id: string;
  label: string;
  name: string;
  placeholder?: string;
  control: any;
  type?: string;
  accept?: string;
  onBlur?: CallableFunction;
  onKeyDown?: CallableFunction;
  disabled?: boolean;
}) => {
  return (
    <>
      <FormLabel htmlFor={id}>
        {label}
      </FormLabel>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl onBlur={() => onBlur && onBlur()}>
              <Input
                className="max-sm:text-xs max-sm:h-8"
                id={id}
                placeholder={placeholder}
                type={type}
                accept={accept}
                {...field}
                onKeyDown={(e) => onKeyDown && onKeyDown(e)}
                disabled={disabled && disabled == true}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default FormTextInput;

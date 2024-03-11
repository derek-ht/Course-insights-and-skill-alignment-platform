import React from "react";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

const FormNumberedInput = ({
  name,
  id,
  form,
  preventEnter,
  onBlur,
}: {
  name: string;
  id: string;
  form: any;
  preventEnter?: boolean;
  onBlur?: () => void
}) => {
  const onNumberChange = (e: any, field: any) => {
    e.target.value.replace(/\D/, "");
    form.setValue(field.name, parseInt(e.target.value));
  };
  const onNumberBlur = (e: any, field: any) => {
    if (e.target.value == "") {
      e.target.value = "1";
      form.setValue(field.name, parseInt(e.target.value));
    }
    onBlur && onBlur();
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl
            onKeyDown={(e) => {
              ["e", "E", "+", "-"].includes(e.key) && e.preventDefault();
              if (preventEnter && e.key == "Enter") {
                e.preventDefault();
              }
            }}
            onChange={(e) => onNumberChange(e, field)}
            onBlur={(e) => onNumberBlur(e, field)}
          >
            <div className="flex gap-4">
              <Input
                min={1}
                className="w-[5rem]"
                type="number"
                id={id}
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormNumberedInput;

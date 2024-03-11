import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

const DEFAULT_IMG = "/assets/rainbowPastel.jpg"
const HOVER_TRANSITION = "border-slate-200 border-2 transition ease-in-out delay-15 box-border hover:shadow-[0_0_1px_4px] hover:shadow-slate-200 cursor-pointer"

const FormImage = ({ label, form, name, id, altText, onBlur }: {
  label: string,
  form: any,
  name: string,
  id: string,
  altText: string
  onBlur?: () => void
}) => {
  const [prevImageUrl, setPreviousImageUrl] = useState(DEFAULT_IMG);

  useEffect(() => {
    setPreviousImageUrl(form.getValues(name) ?? DEFAULT_IMG);
  }, []);

  const handleBlur = async (url: any) => {
    const isImg = await isImgUrl(url);
    if (isImg) {
      setPreviousImageUrl(url);
      onBlur && onBlur();
    } else {
      form.setValue(name, prevImageUrl);
    }
  }

  const isImgUrl = async (url: string) => {
    try {
      const res: any = await fetch(url, { method: 'HEAD' })
      if (res.ok) {
        return res.headers.get('Content-Type').startsWith('image');
      } else {
        throw new Error(`Failed to get ${url}`);
      }
    }
    catch (error) {
      form.setError("coverPhoto", { type: "custom", message: "Invalid Image URL" });
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormLabel htmlFor={id}>
        <img
          src={prevImageUrl}
          alt={altText}
          className={`max-w-[full] w-[24rem] h-[15rem] object-cover mb-4 ${HOVER_TRANSITION} lg:w-[32rem] lg:h-[20rem]`}
        />
      </FormLabel>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl
              onBlur={() => handleBlur(field.value)}
            >
              <Input
                className="w-[20rem]"
                id={id}
                formNoValidate
                {...field}
              />
            </FormControl>
            <FormMessage className="text-center" />
          </FormItem>
        )}
      />
    </div>
  )
}

export default FormImage;

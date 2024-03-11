import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Input } from '../ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

export const DEFAULT_IMG = "/assets/defaultAvatar.jpg"
const FormAvatar = ({ form, name, id, onBlur } : {
  form: any,
  name: string,
  id: string,
  onBlur?: () => void
}) => {
  const [prevImageUrl, setPreviousImageUrl] = useState(DEFAULT_IMG);
  useEffect(() => {
    setPreviousImageUrl(form.getValues("avatar") ?? DEFAULT_IMG);
  }, []);

  const handleBlur = async (url: any) => {
    const isImg = await isImgUrl(url);
    if (isImg) {
      setPreviousImageUrl(url);
      onBlur && onBlur();
    } else {
      form.setValue("avatar", prevImageUrl);
    }
  }

  const isImgUrl = async(url: string) => {
    try {
      const res: any = await fetch(url, {method: 'HEAD'})
      if (res.ok) {
        return res.headers.get('Content-Type').startsWith('image');
      } else {
        throw new Error(`Failed to get ${url}`);
      }
    }
    catch(error) {
      form.setError("avatar", {type: "custom", message: "Invalid Image URL"});
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <FormLabel htmlFor={id}>Profile Avatar URL</FormLabel>
      <FormLabel htmlFor={id}>
        <Avatar className="h-24 w-24 my-2 border-slate-200 border-2 transition ease-in-out delay-15 box-border hover:shadow-[0_0_1px_4px] hover:shadow-slate-200 cursor-pointer">
          <AvatarImage
            src={prevImageUrl}
          />
          <AvatarFallback>Profile picture</AvatarFallback>
        </Avatar>
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
                className="w-[15rem]"
                id={id}
                formNoValidate
                {...field}
              />
            </FormControl>
            <FormMessage className="text-center"/>
          </FormItem>
        )}
      />
    </div>
  )
}

export default FormAvatar;

import React from 'react'

const FormGrid = ({children} : {children: React.ReactNode}) => {
  return (
    <div className="grid grid-cols-[1fr_minmax(200px,_2fr)] my-5 items-start gap-4 md:pl-10">
      {children}
    </div>
  )
}

export default FormGrid;
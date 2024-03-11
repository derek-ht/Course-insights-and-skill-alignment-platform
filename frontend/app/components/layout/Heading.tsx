import React from 'react'

const Heading = ({children}: {children: React.ReactNode}) => {
  return <h1 className="text-2xl font-semibold mr-6 my-4">
    {children}
  </h1>
}

export default Heading
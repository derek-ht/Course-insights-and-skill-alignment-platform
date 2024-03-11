import React from 'react'
import Image from "next/image";
import AuthVector from "/public/assets/auth_vector.svg";
import { Separator } from "../ui/separator"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area"
import { Button } from '../ui/button';

const ProjectSummaries = () => {
  return (
    <>
    <div className="my-12 mr-6 flex items-center w-1/2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around w-full h-[30rem]">
            <ScrollArea className="w-full rounded-md border p-4">
              <div>
                <div className="mx-4 mt-4 rounded transition ease-in-out delay-15 hover:bg-slate-50 cursor-pointer">
                  <Button variant="link" className='text-lg'>Project 1</Button>
                  <div className='px-4 text-opacity-70'>
                    Being developed by: progchamps
                  </div>
                  <div className='px-4 py-4'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur malesuada dolor vitae nunc vestibulum sagittis. Curabitur ultrices nibh et dictum posuere. Donec accumsan, tellus vel rhoncus aliquam, nibh elit commodo sapien, ac vestibulum ipsum nulla feugiat nisl. Ut vulputate aliquam hendrerit. Suspendisse vel magna in nulla sagittis pretium ac vel tortor. Proin condimentum, lorem egestas euismod dignissim, ex erat pharetra tellus, sed pretium eros elit sed lectus. Duis non auctor tortor.
                  </div>
                </div>
                  <Separator className="my-6"/>
              </div>
              <div>
                <div className="mx-4 mt-4 rounded transition ease-in-out delay-15 hover:bg-slate-50 cursor-pointer">
                  <Button variant="link" className='text-lg'>Project 2</Button>
                  <div className='px-4 pt-4 text-opacity-70'>
                    Being developed by: progchamps
                  </div>
                  <div className='px-4 py-4'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur malesuada dolor vitae nunc vestibulum sagittis. Curabitur ultrices nibh et dictum posuere. Donec accumsan, tellus vel rhoncus aliquam, nibh elit commodo sapien, ac vestibulum ipsum nulla feugiat nisl. Ut vulputate aliquam hendrerit. Suspendisse vel magna in nulla sagittis pretium ac vel tortor. Proin condimentum, lorem egestas euismod dignissim, ex erat pharetra tellus, sed pretium eros elit sed lectus. Duis non auctor tortor.
                  </div>
                </div>
                  <Separator className="my-6"/>
              </div><div>
                <div className="mx-4 mt-4 rounded transition ease-in-out delay-15 hover:bg-slate-50 cursor-pointer">
                  <Button variant="link" className='text-lg'>Project 3</Button>
                  <div className='px-4 pt-4 text-opacity-70'>
                    Being developed by: progchamps
                  </div>
                  <div className='px-4 py-4'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur malesuada dolor vitae nunc vestibulum sagittis. Curabitur ultrices nibh et dictum posuere. Donec accumsan, tellus vel rhoncus aliquam, nibh elit commodo sapien, ac vestibulum ipsum nulla feugiat nisl. Ut vulputate aliquam hendrerit. Suspendisse vel magna in nulla sagittis pretium ac vel tortor. Proin condimentum, lorem egestas euismod dignissim, ex erat pharetra tellus, sed pretium eros elit sed lectus. Duis non auctor tortor.
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default ProjectSummaries

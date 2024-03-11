import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { GroupMemberType } from '@/app/utils/GroupUtils'

const GroupMemberAvatar = ({ member }: {
  member: GroupMemberType
}) => {
  return (
    <div className="flex items-center gap-4 my-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={member.avatar} />
        <AvatarFallback>Profile picture</AvatarFallback>
      </Avatar>
      <b>{member.firstName} {member.lastName}</b>
    </div>

  )
}

export default GroupMemberAvatar;
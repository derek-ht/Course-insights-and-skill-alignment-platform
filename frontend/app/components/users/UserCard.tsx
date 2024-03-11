import React from "react";
import { Badge } from "../ui/badge";
import DeleteUserDialogue from "./DeleteUserDialogue";
import { formatUserType, userDataType } from "../../utils/UserUtils";
import AdminEditDialogue from "./AdminEditDialogue";
import { useRouter } from "next/navigation";
import BasicCard from "../BasicCard";

const UserCard = ({
  user,
  update,
  isAdmin,
}: {
  user: userDataType;
  update: () => void;
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const type = formatUserType(user.type);

  const handleClick = (e: any) => {
    router.push(`profile/${user.id}`);
  };
  return (
    <BasicCard
      titleChildren={`${user.firstName} ${user.lastName}`}
      onClick={(e: any) => handleClick(e)}
      hover={true}
      cardAttr="flex flex-col rounded-sm items-center mb-6 sm:flex-row"
      headerAttr="text-center md:w-[10rem] lg:w-1/6"
      titleAttr="w-[12rem]"
      contentAttr="w-full py-6 items-center space-y-0 h-full space-x-2 md:grid md:grid-cols-[1fr,1fr,1fr,2fr] md:w-5/6 md:justify-end md:ml-8 "
      contentChildren={
        <>
          <Badge className="py-1 w-[5rem] h-fit">{type}</Badge>
          <p className="text-left">
            {user.school ? <>School of {user.school}</> : <>No School</>}
          </p>
          <p className="text-left">
            {user.degree ? <>{user.degree}</> : <></>}
          </p>
          <div className="flex w-full items-center space-x-2 md:justify-end">
            <div className="flex-grow overflow-ellipsis whitespace-nowrap overflow-hidden md:w-[7rem] lg:w-[20rem]">
              {user.email}
            </div>
            {isAdmin && (
              <>
                <div onClick={(e: any) => e.stopPropagation()}>
                  <AdminEditDialogue
                    user={user}
                    isAuthUser={true}
                    onUpdate={update}
                  />
                </div>
                <div onClick={(e: any) => e.stopPropagation()}>
                  <DeleteUserDialogue user={user} update={update} />
                </div>
              </>
            )}
          </div>
        </>
      }
    />
  );
};

export default UserCard;

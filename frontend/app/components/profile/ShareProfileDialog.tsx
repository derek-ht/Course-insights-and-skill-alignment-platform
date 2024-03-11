"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogFooter, DialogTrigger } from "../ui/dialog";
import Modal from "../Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Copy, Link2, X } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  getUsersSharedTo,
  shareProfileMulti,
  unShareProfile,
  unShareAll,
} from "@/app/utils/UserUtils";

type ShareProfileDialogProps = {
  isPublic: boolean;
};

interface SharedUser {
  id: string;
  email: string;
}

const ShareProfileDialog = ({ isPublic }: ShareProfileDialogProps) => {
  const [toggleShareModal, setToggleShareModal] = useState(false);
  const [shareEmails, setShareEmails] = useState<string[]>([]);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("");
  const { toast } = useToast();

  const fail = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  useEffect(() => {
    const success = (data: any) => {
      setSharedUsers(data.users);
    };
    getUsersSharedTo(success, fail);
    setUserId(localStorage.getItem("uID") ?? "");
  }, []);

  useEffect(() => {
    const success = (data: any) => {
      setSharedUsers(data.users);
    };
    getUsersSharedTo(success, fail);
  }, [toggleShareModal]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && input) {
      if (emailRegex.test(input.trim())) {
        setShareEmails([...shareEmails, input.trim()]);
        setInput("");
      } else {
        toast({
          variant: "destructive",
          description: "Invalid email format",
        });
      }
    }
  };

  const handleUnShare = (id: string) => {
    const success = () => {
      setSharedUsers(sharedUsers.filter((x) => x.id !== id));
    };
    unShareProfile(id, success, fail);
  };

  const removeEmail = (index: number) => {
    setShareEmails(shareEmails.filter((_, i) => i !== index));
  };

  const shareToEmails = (emails: string[]) => {
    if (emails.length !== 0) {
      const success = () => {
        setShareEmails([]);
        setInput("");
        setToggleShareModal(false);
      };
      shareProfileMulti(emails, success, fail);
    } else {
      toast({
        variant: "destructive",
        description: "Please enter at least one email",
      });
    }
  };

  const shareableLink = "http://localhost:3001/profile/" + userId;

  return (
    <Dialog open={toggleShareModal} onOpenChange={setToggleShareModal}>
      <DialogTrigger asChild>
        <Button className="mt-2 w-full max-w-[7.1rem]">Share Profile</Button>
      </DialogTrigger>
      <Modal
        titleChildren={"Share your profile"}
        descriptionChildren={
          isPublic
            ? "Share your profile with others via this link:"
            : "Share your profile with others via their email:"
        }
        contentChildren={
          <div className="flex justify-center">
            {isPublic ? (
              <div className="flex w-full items-center space-x-2">
                <Input readOnly defaultValue={shareableLink} />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(shareableLink);
                    toast({
                      description: "Link copied to clipboard.",
                    });
                  }}
                >
                  <Copy />
                </Button>
              </div>
            ) : (
              <div className="flex w-full flex-col items-center space-y-3">
                <div className="w-full">
                  {shareEmails.map((email, index) => (
                    <Badge variant={"outline"} className="m-1 text-[0.9rem]">
                      {email}
                      <div className="cursor-pointer">
                        <X onClick={() => removeEmail(index)} />
                      </div>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder={"Enter email then press enter"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="w-full">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Shared to</div>
                    {sharedUsers.length !== 0 && (
                      <Button
                        variant={"secondary"}
                        onClick={() => {
                          unShareAll(() => setSharedUsers([]), fail);
                        }}
                      >
                        Unshare to all
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[10rem]">
                    {sharedUsers.length === 0 ? (
                      <div className="flex justify-center test-xs">
                        No users shared to
                      </div>
                    ) : (
                      <div>
                        {sharedUsers.map((user) => (
                          <div className="flex justify-between p-2 items-center">
                            {user.email}
                            <div className="cursor-pointer">
                              <X onClick={() => handleUnShare(user.id)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        }
        footerChildren={
          !isPublic ? (
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(shareableLink);
                  toast({
                    description: "Link copied to clipboard.",
                  });
                }}
                className="gap-2"
              >
                <Link2 /> Copy Link
              </Button>
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShareEmails([]);
                    setInput("");
                    setToggleShareModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => shareToEmails(shareEmails)}>
                  Share
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setToggleShareModal(false)}
              type="button"
              variant="secondary"
            >
              Close
            </Button>
          )
        }
        contentAttr=""
        onPointerDownOutside={(e) => e.preventDefault()}
      />
    </Dialog>
  );
};

export default ShareProfileDialog;

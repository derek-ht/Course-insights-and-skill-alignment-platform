"use client";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../ui/badge";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { addProject } from "@/app/utils/ProjectUtils";
import FormTextInput from "../form/FormTextInput";
import FormNumberedInput from "../form/FormNumberedInput";
import { X } from "lucide-react";
import FormHeading from "../form/FormHeading";
import FormGrid from "../form/FormGrid";
import { useToast } from "../ui/use-toast";
import FormTextArea from "../form/FormTextArea";

const createProjectSchema = z
  .object({
    title: z.string().min(1, { message: "Please enter a title" }),
    description: z.string(),
    scope: z.string().min(1, { message: "Please enter the scope" }),
    topics: z
      .string()
      .array()
      .nonempty({ message: "Please add at least one topic" })
      .refine((items) => new Set(items).size === items.length, {
        message: "Topic must be unique",
      }),
    requiredSkills: z
      .string()
      .array()
      .nonempty({ message: "Please add at least one required skill" })
      .refine((items) => new Set(items).size === items.length, {
        message: "Required skill must be unique",
      }),
    outcomes: z
      .string()
      .array()
      .nonempty({ message: "Please add at least one outcome" })
      .refine((items) => new Set(items).size === items.length, {
        message: "Outcome must be unique",
      }),
    maxGroupSize: z.coerce.number().positive(),
    minGroupSize: z.coerce.number().positive(),
    maxGroupCount: z.coerce.number().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.minGroupSize > data.maxGroupSize) {
      ctx.addIssue({
        code: "custom",
        message: "Min group size cannot be greater than max",
        path: ["minGroupSize"],
      });
    }
  });

export type projectParams = z.infer<typeof createProjectSchema>;

const ProjectCreateForm = ({ onUpdate }: { onUpdate: () => void }) => {
  const { toast } = useToast();
  const [currentSkill, setCurrentSkill] = useState<string>("");
  const [currentOutcome, setCurrentOutcome] = useState<string>("");
  const [currentTopic, setCurrentTopic] = useState<string>("");

  const createForm = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      scope: "",
      topics: [],
      requiredSkills: [],
      outcomes: [],
      maxGroupSize: 1,
      minGroupSize: 1,
      maxGroupCount: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
    const onSuccess = (value: any) => {
      onUpdate();
    };
    addProject(values, onSuccess, (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    });
  };

  const addAttr = (key: any, currValue: string, set: CallableFunction) => {
    if (currValue === "") return;
    const values: any = createForm.getValues(key);
    createForm.setValue(key, [...values, currValue.toLowerCase()]);
    set("");
  };

  const removeAttr = (key: any, value: string) => {
    const filterArr: any = createForm.getValues(key).filter((v: string) => {
      const keepValue = v !== value;
      if (!keepValue) {
        value = "";
      }
      return keepValue;
    });
    createForm.setValue(key, filterArr);
  };

  const addTopic = () => addAttr("topics", currentTopic, setCurrentTopic);
  const removeTopic = (value: string) => removeAttr("topics", value);
  const addSkill = () =>
    addAttr("requiredSkills", currentSkill, setCurrentSkill);
  const removeSkill = (value: string) => removeAttr("requiredSkills", value);
  const addOutcome = () =>
    addAttr("outcomes", currentOutcome, setCurrentOutcome);
  const removeOutcome = (value: string) => removeAttr("outcomes", value);

  return (
    <Form {...createForm}>
      <form
        onSubmit={createForm.handleSubmit(onSubmit)}
        className="space-y-8 pl-2 pr-4 lg:p-0 mb-4 "
      >
        <FormHeading>Project</FormHeading>
        <FormGrid>
          <FormTextInput
            id="project-title"
            label="Title"
            name="title"
            placeholder="Please enter a project title"
            control={createForm.control}
          />
          <FormLabel htmlFor="project-description">Description</FormLabel>
          <FormField
            control={createForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    id="project-description"
                    className="resize-none"
                    placeholder="Please enter a project description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormTextArea
            id="project-scope"
            label="Scope"
            name="scope"
            placeholder="Enter Scope"
            onBlur={createForm.handleSubmit(onSubmit)}
            control={createForm.control}
          />
          <FormLabel htmlFor="project-topics">Topics</FormLabel>
          <FormField
            control={createForm.control}
            name="topics"
            render={() => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-4">
                    <Input
                      id="project-topics"
                      placeholder="Please enter topics"
                      value={currentTopic}
                      onChange={(e) => setCurrentTopic(e.target.value)}
                    />
                    <Button type="button" onClick={addTopic}>
                      +
                    </Button>
                  </div>
                </FormControl>
                <DisplayBadges
                  values={createForm.getValues().topics}
                  onRemove={removeTopic}
                />

                <FormMessage />
              </FormItem>
            )}
          />
          <FormLabel htmlFor="project-skills">Skill Requirements</FormLabel>
          <FormField
            control={createForm.control}
            name="requiredSkills"
            render={() => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-4">
                    <Input
                      id="project-skills"
                      placeholder="Please enter skills"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                    />
                    <Button type="button" onClick={addSkill}>
                      +
                    </Button>
                  </div>
                </FormControl>
                <DisplayBadges
                  values={createForm.getValues().requiredSkills}
                  onRemove={removeSkill}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormLabel htmlFor="project-outcomes">Expected Outcomes</FormLabel>
          <FormField
            control={createForm.control}
            name="outcomes"
            render={() => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-4">
                    <Input
                      id="project-outcomes"
                      placeholder="Please enter outcomes"
                      value={currentOutcome}
                      onChange={(e) => setCurrentOutcome(e.target.value)}
                    />
                    <Button type="button" onClick={addOutcome}>
                      +
                    </Button>
                  </div>
                </FormControl>
                <DisplayBadges
                  values={createForm.getValues().outcomes}
                  onRemove={removeOutcome}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </FormGrid>

        <FormHeading>Group Information</FormHeading>
        <FormGrid>
          <FormLabel htmlFor="project-min-groupsize">
            Minimum Group Size
          </FormLabel>
          <FormNumberedInput
            name="minGroupSize"
            id="project-min-groupsize"
            form={createForm}
          />
          <FormLabel htmlFor="project-max-group-size">
            Maximum Group Size
          </FormLabel>
          <FormNumberedInput
            name="maxGroupSize"
            id="project-max-group-size"
            form={createForm}
          />
          <FormLabel htmlFor="project-max-groups">
            Maximum Number of groups
          </FormLabel>
          <FormNumberedInput
            name="maxGroupCount"
            id="project-max-groups"
            form={createForm}
          />
        </FormGrid>
        <div className="flex justify-center">
          <Button type="submit">Create Project</Button>
        </div>
      </form>
    </Form>
  );
};

const DisplayBadges = ({
  values,
  onRemove,
}: {
  values: string[];
  onRemove: CallableFunction;
}) => {
  return (
    <>
      {values.map((v, index) => {
        return (
          <Badge
            className="mr-1"
            key={`${v}-${index}`}
            onClick={() => onRemove(v)}
          >
            {v} <X className="w-4 h-auto" />
          </Badge>
        );
      })}
    </>
  );
};

export default ProjectCreateForm;

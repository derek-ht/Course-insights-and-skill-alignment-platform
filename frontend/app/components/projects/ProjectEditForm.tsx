import React, { useEffect, useState } from "react";
import FormGrid from "../form/FormGrid";
import FormHeading from "../form/FormHeading";
import FormTextInput from "../form/FormTextInput";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import FormTextArea from "../form/FormTextArea";
import FormNumberedInput from "../form/FormNumberedInput";
import FormImage from "../form/FormImage";
import {
  Dimensions,
  getImageDimensions,
  projectSchema,
} from "../../utils/FormValidation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import {
  editProjectCoverPhoto,
  editProjectDescription,
  editProjectMaxGroupCount,
  editProjectGroupSize,
  editProjectOutcomes,
  editProjectScope,
  editProjectSkills,
  editProjectTitle,
  editProjectTopics,
} from "@/app/utils/ProjectUtils";
import { useToast } from "../ui/use-toast";

const ProjectEditForm = ({
  project,
  setSaved,
}: {
  project: any;
  setSaved: CallableFunction;
}) => {
  const { toast } = useToast();
  const [currentSkill, setCurrentSkill] = useState<string>("");
  const [currentOutcome, setCurrentOutcome] = useState<string>("");
  const [currentTopic, setCurrentTopic] = useState<string>("");

  const defaultValues = {
    title: project.title,
    description: project.description ?? "",
    scope: project.scope,
    topics: project.topics,
    requiredSkills: project.requiredSkills,
    outcomes: project.outcomes,
    maxGroupSize: project.maxGroupSize,
    minGroupSize: project.minGroupSize,
    maxGroupCount: project.maxGroupCount,
    coverPhoto: project.coverPhoto ?? "",
  };

  const editProjectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    mode: "onBlur",
    defaultValues,
  });

  useEffect(() => {
    editProjectForm.reset(defaultValues);
  }, [project]);

  // Add a new element to a field containing an array and submit the new array
  const addAttr = (
    key: any,
    currValue: string,
    set: CallableFunction,
    apiCall: CallableFunction
  ) => {
    if (currValue === "") return;
    const values: any = editProjectForm.getValues(key);
    set("");
    editProjectForm.setValue(key, [...values, currValue.toLowerCase()]);
    submitAttr(key, apiCall);
  };

  // Remove an element from a field containing an array and submit the new array
  const removeAttr = (key: any, value: string, apiCall: CallableFunction) => {
    const filterArr: any = editProjectForm
      .getValues(key)
      .filter((v: string) => {
        const keepValue = v !== value;
        if (!keepValue) {
          value = "";
        }
        return keepValue;
      });
    // Validate removed attributes before submission
    editProjectForm.setValue(key, filterArr);
    submitAttr(key, apiCall);
  };

  const submitAttr = (key: any, apiCall: CallableFunction) => {
    editProjectForm.trigger(key).then((res) => {
      if (res)
        apiCall(project.id, editProjectForm.getValues(key), onSuccess, onError);
    });
  };
  const addTopic = () =>
    addAttr("topics", currentTopic, setCurrentTopic, editProjectTopics);
  const addSkill = () =>
    addAttr("requiredSkills", currentSkill, setCurrentSkill, editProjectSkills);
  const addOutcome = () =>
    addAttr("outcomes", currentOutcome, setCurrentOutcome, editProjectOutcomes);
  const removeTopic = (value: string) =>
    removeAttr("topics", value, editProjectTopics);
  const removeSkill = (value: string) =>
    removeAttr("requiredSkills", value, editProjectSkills);
  const removeOutcome = (value: string) =>
    removeAttr("outcomes", value, editProjectOutcomes);

  // Success and Error Functions
  const onSuccess = (value: any) => setSaved(true);
  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    const uId = localStorage.getItem("uID");
    if (uId == null) return;

    const onPhotoSubmitSuccess = (value: any) => {
      editProjectForm.setValue("coverPhoto", value.imagePath);
      onSuccess(value);
    };
    const onPhotoSubmitError = (error: string) =>
      editProjectForm.setError("coverPhoto", {
        type: "custom",
        message: error,
      });

    const formValues = [
      {
        newValue: values.title,
        currValue: project.title,
        formChange: () =>
          editProjectTitle(project.id, values.title, onSuccess, onError),
      },
      {
        newValue: values.description,
        currValue: project.description,
        formChange: () =>
          editProjectDescription(
            project.id,
            values.description,
            onSuccess,
            onError
          ),
      },
      {
        newValue: values.scope,
        currValue: project.scope,
        formChange: () =>
          editProjectScope(project.id, values.scope, onSuccess, onError),
      },
      {
        newValue: values.minGroupSize,
        currValue: project.minGroupSize,
        formChange: () =>
          editProjectGroupSize(
            project.id,
            values.minGroupSize,
            values.maxGroupSize,
            onSuccess,
            onError
          ),
      },
      {
        newValue: values.maxGroupSize,
        currValue: project.maxGroupSize,
        formChange: () =>
          editProjectGroupSize(
            project.id,
            values.minGroupSize,
            values.maxGroupSize,
            onSuccess,
            onError
          ),
      },
      {
        newValue: values.maxGroupCount,
        currValue: project.maxGroupCount,
        formChange: () =>
          editProjectMaxGroupCount(
            project.id,
            values.maxGroupCount,
            onSuccess,
            onError
          ),
      },
      {
        newValue: values.coverPhoto,
        currValue: project.coverPhoto,
        formChange: () => {
          getImageDimensions(values.coverPhoto, (dimensions: Dimensions) => {
            editProjectCoverPhoto(
              project.id,
              values.coverPhoto,
              dimensions.width,
              dimensions.height,
              onPhotoSubmitSuccess,
              onPhotoSubmitError
            );
          });
        },
      },
    ];
    for (let value of formValues) {
      if (value.currValue !== value.newValue) {
        value.formChange();
      }
    }
  };
  return (
    <Form {...editProjectForm}>
      <form className="space-y-8 pl-2 pr-4 lg:p-0 lg:mb-4">
        <FormHeading>Project Cover Photo</FormHeading>
        <FormImage
          label="Project Cover Photo URL"
          form={editProjectForm}
          name="coverPhoto"
          id="project-photo"
          onBlur={editProjectForm.handleSubmit(onSubmit)}
          altText="Project Cover Photo"
        />
        <FormHeading>Edit Project</FormHeading>
        <FormGrid>
          <FormTextInput
            id="project-title"
            label="Title"
            name="title"
            onBlur={editProjectForm.handleSubmit(onSubmit)}
            control={editProjectForm.control}
          />
          <FormTextArea
            id="project-description"
            label="Description"
            name="description"
            placeholder="Enter description"
            onBlur={editProjectForm.handleSubmit(onSubmit)}
            control={editProjectForm.control}
          />
          <FormTextArea
            id="project-scope"
            label="Scope"
            name="scope"
            placeholder="Enter Scope"
            onBlur={editProjectForm.handleSubmit(onSubmit)}
            control={editProjectForm.control}
          />
          <FormLabel htmlFor="project-topics">Topics</FormLabel>
          <FormField
            control={editProjectForm.control}
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
                  values={editProjectForm.getValues().topics}
                  onRemove={removeTopic}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormLabel htmlFor="project-skills">Skill Requirements</FormLabel>
          <FormField
            control={editProjectForm.control}
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
                  values={editProjectForm.getValues().requiredSkills}
                  onRemove={removeSkill}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormLabel htmlFor="project-outcomes">Expected Outcomes</FormLabel>
          <FormField
            control={editProjectForm.control}
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
                  values={editProjectForm.getValues().outcomes}
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
            onBlur={editProjectForm.handleSubmit(onSubmit)}
            form={editProjectForm}
          />
          <FormLabel htmlFor="project-max-groupsize">
            Maximum Group Size
          </FormLabel>
          <FormNumberedInput
            name="maxGroupSize"
            id="project-max-groupsize"
            onBlur={editProjectForm.handleSubmit(onSubmit)}
            form={editProjectForm}
          />
          <FormLabel htmlFor="project-max-groups">
            Maximum Number of groups
          </FormLabel>
          <FormNumberedInput
            name="maxGroupCount"
            id="project-max-groups"
            onBlur={editProjectForm.handleSubmit(onSubmit)}
            form={editProjectForm}
          />
        </FormGrid>
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

export default ProjectEditForm;

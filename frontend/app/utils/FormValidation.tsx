import * as z from "zod";

// REGEXES 
export const nameRegex = new RegExp("^[a-z ,.'-]+$", "i");

export const passwordRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&'])[A-Za-z\\d@$!%*?&]{8,}$"
);
export const phoneRegex = new RegExp(
  /^(04[0-9]{8}|)$/
);

// ZOD Form validation Schemas
export const projectSchema = z
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
    coverPhoto: z.string().url(),
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

export const editProfileSchema = z.object({
  firstname: z.string().regex(nameRegex, { message: "Invalid name" }),
  lastname: z.string().regex(nameRegex, { message: "Invalid name" }),
  school: z.string(),
  degree: z.string(),
  phoneNumber: z.string().regex(phoneRegex, "Invalid Number"),
  avatar: z.string().url(),
  type: z.string(),
});

export const editGroupSchema = z.object({
  name: z.string().min(1, { message: "Please enter a group name" }),
  description: z.string(),
  size: z.coerce.number().positive(),
  coverPhoto: z.string().url(),
});

// Image Validation
export interface Dimensions {
  width: number,
  height: number
};

export const getImageDimensions = (
  url: string,
  onSuccess: (dimensions: Dimensions) => void
) => {
  const image = new Image();
  image.src = url;
  image.onload = () => {
    onSuccess({
      width: image.width,
      height: image.height
    })
  }
};
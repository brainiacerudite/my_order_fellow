import z from "zod";

const contactPersonSchema = z.object({
    name: z.string().min(2, "Contact name is required"),
    phone: z.string().min(10, "Contact valid phone number is required"),
    email: z.email("Contact valid email is required").optional(),
    role: z.string().min(2, "Contact role is required").optional(),
});

export const submitKycSchema = z.object({
    registrationNumber: z.string().min(2, "Registration number is required"),
    businessAddress: z.string().min(5, "Business address is required"),
    contactDetails: contactPersonSchema
});

export type SubmitKycInput = z.infer<typeof submitKycSchema>;
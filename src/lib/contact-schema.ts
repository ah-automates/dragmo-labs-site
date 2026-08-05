export type ContactFormValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  budget: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactFormValues, string>>;

export const emptyContactForm: ContactFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  interest: "",
  budget: "",
  message: "",
};

export const interestOptions = [
  "AI Solutions",
  "AI Automation",
  "Website Design & Development",
  "Web Applications",
  "UI/UX Design",
  "Digital Transformation",
  "Other or not sure yet",
];

export const budgetOptions = [
  "Under $10k",
  "$10k to $25k",
  "$25k to $50k",
  "$50k to $100k",
  "$100k+",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Error copy states the fix, in second person. */
export function validateContact(values: ContactFormValues): ContactErrors {
  const errors: ContactErrors = {};

  if (!values.name.trim()) {
    errors.name = "Enter your full name.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Enter at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Enter a valid address, like jane@company.com.";
  }

  if (values.phone.trim() && !/^[\d\s()+.-]{7,}$/.test(values.phone.trim())) {
    errors.phone = "Use digits, spaces, and + ( ) . - only.";
  }

  if (!values.message.trim()) {
    errors.message = "Tell us briefly what you need.";
  } else if (values.message.trim().length < 20) {
    errors.message = "Add a little more detail, at least 20 characters.";
  }

  return errors;
}

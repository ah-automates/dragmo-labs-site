import type { Metadata } from "next";

import { PolicyDocument, policyMetadata } from "@/components/shared/policy-document";
import { policies } from "@/lib/policies";

const policy = policies["privacy-policy"];

export const metadata: Metadata = policyMetadata(policy);

export default function PrivacyPolicyPage() {
  return <PolicyDocument policy={policy} />;
}

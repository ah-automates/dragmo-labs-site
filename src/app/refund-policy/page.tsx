import type { Metadata } from "next";

import { PolicyDocument, policyMetadata } from "@/components/shared/policy-document";
import { policies } from "@/lib/policies";

const policy = policies["refund-policy"];

export const metadata: Metadata = policyMetadata(policy);

export default function RefundPolicyPage() {
  return <PolicyDocument policy={policy} />;
}

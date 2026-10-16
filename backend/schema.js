const riskReportSchema = {
  type: "object",
  properties: {
    documentType: {
      type: "string",
      enum: ["terms_of_service", "privacy_policy", "subscription_terms", "other"]
    },
    summaryTr: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: [
              "auto_renewal",
              "cancellation_refund",
              "price_change_hidden_fees",
              "personal_data_sharing",
              "data_retention_deletion",
              "user_content_rights",
              "unilateral_changes",
              "liability_limitation",
              "account_termination",
              "other"
            ]
          },
          severity: { type: "string", enum: ["low", "medium", "high"] },
          quote: { type: "string" },
          explanationTr: { type: "string" },
          whyItMattersTr: { type: "string" }
        },
        required: ["category", "severity", "quote", "explanationTr", "whyItMattersTr"],
        additionalProperties: false
      }
    },
    uncertainty: {
      type: "object",
      properties: {
        isUncertain: { type: "boolean" },
        reason: { type: ["string", "null"] }
      },
      required: ["isUncertain", "reason"],
      additionalProperties: false
    }
  },
  required: ["documentType", "summaryTr", "findings", "uncertainty"],
  additionalProperties: false
};

module.exports = { riskReportSchema };
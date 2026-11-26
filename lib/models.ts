import "server-only";
import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const httpUrl = {
  validator: (value: string | undefined | null) => {
    if (!value) return true;
    try { return ["http:", "https:"].includes(new URL(value).protocol); }
    catch { return false; }
  },
  message: "Use an http or https URL.",
};
const text = (maxLength: number) => ({ type: String, trim: true, maxlength: maxLength });
const url = () => ({ ...text(2048), validate: httpUrl });
const visibility = {
  status: { type: String, enum: ["draft", "published"], default: "draft", required: true },
  sortOrder: { type: Number, default: 0, required: true },
} as const;
const options = { timestamps: true, strict: "throw", bufferCommands: false } as const;

const profileSchema = new Schema({
  key: { type: String, enum: ["primary"], default: "primary", required: true, unique: true },
  displayName: { ...text(100), required: true },
  headline: text(160),
  introduction: text(5000),
  interests: { type: [String], default: [] },
  email: { ...text(254), lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  githubUrl: url(),
  linkedInUrl: url(),
  websiteUrl: url(),
}, options);

const projectSchema = new Schema({
  title: { ...text(160), required: true },
  slug: { ...text(160), required: true, lowercase: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, unique: true },
  summary: text(500),
  description: text(20000),
  technologies: { type: [String], default: [] },
  repositoryUrl: url(),
  liveUrl: url(),
  imageUrl: url(),
  featured: { type: Boolean, default: false },
  github: {
    repositoryId: Number,
    fullName: text(256),
    defaultBranch: text(256),
    language: text(100),
    stars: { type: Number, min: 0 },
    pushedAt: Date,
    syncedAt: Date,
  },
  ...visibility,
}, options);
projectSchema.index({ "github.repositoryId": 1 }, { unique: true, partialFilterExpression: { "github.repositoryId": { $type: "number" } } });
projectSchema.index({ status: 1, featured: -1, sortOrder: 1 });

const skillSchema = new Schema({
  name: { ...text(100), required: true },
  category: text(100),
  description: text(1000),
  ...visibility,
}, options);

const credentialSchema = new Schema({
  name: { ...text(160), required: true },
  issuer: text(160),
  issuedAt: Date,
  expiresAt: Date,
  credentialUrl: url(),
  description: text(1000),
  ...visibility,
}, options);

const timelineSchema = new Schema({
  title: { ...text(160), required: true },
  organization: text(160),
  startDate: { type: Date, required: true },
  endDate: Date,
  description: text(5000),
  ...visibility,
}, options);

const siteSettingsSchema = new Schema({
  key: { type: String, enum: ["primary"], default: "primary", required: true, unique: true },
  siteTitle: { ...text(160), required: true },
  siteDescription: text(500),
  githubUsername: { ...text(39), match: /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i },
}, options);

export type ProfileDocument = InferSchemaType<typeof profileSchema>;
export type ProjectDocument = InferSchemaType<typeof projectSchema>;
export type SkillDocument = InferSchemaType<typeof skillSchema>;
export type CredentialDocument = InferSchemaType<typeof credentialSchema>;
export type TimelineDocument = InferSchemaType<typeof timelineSchema>;
export type SiteSettingsDocument = InferSchemaType<typeof siteSettingsSchema>;

// Reuse models during development hot reload rather than recompiling them.
export const Profile = (models.Profile as Model<ProfileDocument>) || model("Profile", profileSchema);
export const Project = (models.Project as Model<ProjectDocument>) || model("Project", projectSchema);
export const Skill = (models.Skill as Model<SkillDocument>) || model("Skill", skillSchema);
export const Credential = (models.Credential as Model<CredentialDocument>) || model("Credential", credentialSchema);
export const Timeline = (models.Timeline as Model<TimelineDocument>) || model("Timeline", timelineSchema);
export const SiteSettings = (models.SiteSettings as Model<SiteSettingsDocument>) || model("SiteSettings", siteSettingsSchema);

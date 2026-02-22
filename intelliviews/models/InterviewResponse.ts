import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface for type safety
export interface IInterviewResponse extends Document {
  candidateId: string;
  candidateEmail: string;
  interviewType: "technical1" | "technical2" | "behavioural";
  taskId: number;
  taskTitle: string;
  response: string;
  startedAt: Date;
  submittedAt: Date;
  timeSpentSeconds: number;
  metadata?: {
    hintsViewed?: boolean;
    runCount?: number;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const InterviewResponseSchema = new Schema<IInterviewResponse>(
  {
    candidateId: {
      type: String,
      required: true,
      index: true,
    },
    candidateEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ["technical1", "technical2", "behavioural"],
      required: true,
    },
    taskId: {
      type: Number,
      required: true,
    },
    taskTitle: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
    },
    timeSpentSeconds: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Compound index for efficient queries
InterviewResponseSchema.index({ candidateId: 1, interviewType: 1, taskId: 1 });

// Prevent model recompilation during hot reload in development
const InterviewResponse: Model<IInterviewResponse> =
  mongoose.models.InterviewResponse ||
  mongoose.model<IInterviewResponse>("InterviewResponse", InterviewResponseSchema);

export default InterviewResponse;

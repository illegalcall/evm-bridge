import mongoose, { Document, Schema } from "mongoose";

// -------------------------
// Interfaces
// -------------------------
export interface IBlock extends Document {
  chain: string;
  lastBlock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILog extends Document {
  chain: string;
  transactionHash: string;
  blockNumber: number;
  from: string;
  amount: string;
  processed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// -------------------------
// Schemas
// -------------------------
const BlockSchema = new Schema<IBlock>(
  {
    chain: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    lastBlock: { 
      type: Number, 
      required: true 
    }
  },
  { 
    timestamps: true,
    versionKey: false 
  }
);

const LogSchema = new Schema<ILog>(
  {
    chain: { 
      type: String, 
      required: true,
      index: true 
    },
    transactionHash: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    blockNumber: { 
      type: Number, 
      required: true,
      index: true 
    },
    from: { 
      type: String, 
      required: true,
      index: true 
    },
    amount: { 
      type: String, 
      required: true 
    },
    processed: { 
      type: Boolean, 
      required: true, 
      default: false,
      index: true 
    }
  },
  { 
    timestamps: true,
    versionKey: false 
  }
);

// -------------------------
// Models
// -------------------------
export const BlockModel = mongoose.model<IBlock>("Block", BlockSchema);
export const LogModel = mongoose.model<ILog>("Log", LogSchema);

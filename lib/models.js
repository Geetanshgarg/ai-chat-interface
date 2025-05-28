import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    type: String, // Base64 encoded images
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ConversationSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New Conversation'
  },
  model: {
    type: String,
    required: true
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Use existing models if they exist, otherwise create new ones
export const Conversation = mongoose.models.Conversation || 
  mongoose.model('Conversation', ConversationSchema);

export const Message = mongoose.models.Message || 
  mongoose.model('Message', MessageSchema);

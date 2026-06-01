import mongoose from 'mongoose';

const dayPlanSchema = new mongoose.Schema({
  day: Number,
  activities: [{
    time: String,
    title: String,
    description: String,
    location: String,
    cost: Number
  }]
});

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  destination: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  budget: {
    type: String,
    required: true,
  },
  travelers: {
    type: Number,
    required: true,
  },
  preferences: {
    type: [String],
    default: [],
  },
  itinerary: [dayPlanSchema],
  estimatedCost: {
    flights: Number,
    hotels: Number,
    food: Number,
    activities: Number,
    total: Number
  },
  isShared: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;

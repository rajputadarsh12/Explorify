import Trip from '../models/Trip.js';
import User from '../models/User.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// @desc    Create a new empty trip shell
// @route   POST /api/trips/create
// @access  Private
export const createTrip = async (req, res) => {
  const { destination, startDate, endDate, budget, travelers, preferences } = req.body;

  try {
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) || 1;
    
    let generatedItinerary = [];
    let estimatedCost = { flights: 0, hotels: 0, food: 0, activities: 0, total: 0 };

    // Generate empty day shells
    for (let i = 1; i <= days; i++) {
      generatedItinerary.push({
        day: i,
        activities: [] // User will populate this manually
      });
    }

    const trip = await Trip.create({
      user: req.user.id,
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      preferences,
      itinerary: generatedItinerary,
      estimatedCost
    });

    const userDoc = await User.findById(req.user.id);
    if (userDoc) {
      userDoc.points += 10;
      if (!userDoc.badges.includes('Planner')) userDoc.badges.push('Planner');
      await userDoc.save();
    }

    res.status(201).json(trip);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating trip details' });
  }
};

// @desc    Get user trips
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    // Make sure user owns the trip or is a collaborator
    if (trip.user.toString() !== req.user.id && !trip.collaborators.includes(req.user.id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle share status of a trip
// @route   PUT /api/trips/:id/share
// @access  Private
export const shareTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    trip.isShared = !trip.isShared;
    await trip.save();
    
    if (trip.isShared) {
      const userDoc = await User.findById(req.user.id);
      if (userDoc) {
        userDoc.points += 20;
        userDoc.tripsShared += 1;
        if (userDoc.tripsShared >= 3 && !userDoc.badges.includes('Influencer')) {
          userDoc.badges.push('Influencer');
        }
        await userDoc.save();
      }
    }
    
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get shared trip by ID
// @route   GET /api/trips/shared/:id
// @access  Public
export const getSharedTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('user', 'name avatar');
    if (!trip || !trip.isShared) {
      return res.status(404).json({ message: 'Trip not found or is private' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Save/Clone a shared trip to current user's dashboard
// @route   POST /api/trips/:id/save
// @access  Private
export const cloneSharedTrip = async (req, res) => {
  try {
    const originalTrip = await Trip.findById(req.params.id);
    if (!originalTrip || !originalTrip.isShared) {
      return res.status(404).json({ message: 'Trip not found or not shareable' });
    }

    // Create a new trip for the current user based on the original
    const clonedTrip = await Trip.create({
      user: req.user.id,
      destination: originalTrip.destination,
      startDate: originalTrip.startDate,
      endDate: originalTrip.endDate,
      budget: originalTrip.budget,
      travelers: originalTrip.travelers,
      preferences: originalTrip.preferences,
      itinerary: originalTrip.itinerary,
      estimatedCost: originalTrip.estimatedCost,
      isShared: false
    });

    // Give original owner points for their trip being cloned
    const ownerDoc = await User.findById(originalTrip.user);
    if (ownerDoc) {
      ownerDoc.points += 50;
      if (!ownerDoc.badges.includes('Trendsetter')) {
        ownerDoc.badges.push('Trendsetter');
      }
      await ownerDoc.save();
    }

    res.status(201).json(clonedTrip);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    // Make sure user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await trip.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a trip itinerary
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = async (req, res) => {
  try {
    const { itinerary, estimatedCost, actualCost } = req.body;
    let trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if user owns the trip or is a collaborator
    if (trip.user.toString() !== req.user.id && !trip.collaborators.includes(req.user.id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (itinerary) trip.itinerary = itinerary;
    if (estimatedCost) trip.estimatedCost = estimatedCost;
    if (actualCost) trip.actualCost = actualCost;
    
    if (req.uploadedFile) {
      const imagePath = `/uploads/${req.uploadedFile.filename}`;
      trip.images.push(imagePath);
    }
    
    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Suggest destination and budget using AI
// @route   POST /api/trips/suggest
// @access  Private
export const suggestDestination = async (req, res) => {
  const { startDate, endDate, travelers, preferences } = req.body;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      // Fallback if no valid key is provided
      console.log('No valid OpenAI API key provided. Using fallback mock suggestion.');
      return res.status(200).json({
        destination: 'Bali, Indonesia',
        budget: 'Medium'
      });
    }

    const prompt = `
      Act as an expert travel agent. 
      I am a beginner traveler looking for a destination suggestion.
      Here are my details:
      - Travel Dates: ${startDate} to ${endDate}
      - Number of Travelers: ${travelers}
      - Preferences: ${preferences.join(', ')}
      
      Based on this, suggest ONE destination and a budget level for this trip. 
      The budget level MUST be exactly one of: "Budget-friendly", "Medium", or "Luxury".
      
      Respond with ONLY a JSON object in this format (no markdown code blocks, no extra text):
      {
        "destination": "City, Country",
        "budget": "Budget Level"
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    let suggestionStr = response.choices[0].message.content.trim();
    // In case it returns markdown format anyway, try to parse it
    if (suggestionStr.startsWith('\`\`\`json')) {
      suggestionStr = suggestionStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    }
    
    const suggestion = JSON.parse(suggestionStr);

    // Validate budget level
    if (!['Budget-friendly', 'Medium', 'Luxury'].includes(suggestion.budget)) {
      suggestion.budget = 'Medium';
    }

    res.status(200).json(suggestion);

  } catch (error) {
    console.error('Error suggesting destination:', error);
    // Fallback on error
    res.status(200).json({
      destination: 'Tokyo, Japan',
      budget: 'Luxury'
    });
  }
};

// @desc    Generate a full AI itinerary based on existing trips
// @route   POST /api/trips/generate
// @access  Private
export const generateTrip = async (req, res) => {
  const { destination, startDate, endDate, budget, travelers, preferences } = req.body;

  try {
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) || 1;
    
    let existingTripsText = "No existing trips found for this destination.";
    try {
      const existingTrips = await Trip.find({ destination: new RegExp(destination, 'i'), isShared: true }).limit(5);
      if (existingTrips.length > 0) {
        existingTripsText = existingTrips.map(t => JSON.stringify(t.itinerary)).join("\n---\n");
      }
    } catch (dbError) {
      console.log('Error fetching existing trips:', dbError);
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      // Fallback
      const trip = await Trip.create({
        user: req.user.id,
        destination, startDate, endDate, budget, travelers, preferences,
        itinerary: Array.from({ length: days }).map((_, i) => ({ day: i + 1, activities: [] })),
        estimatedCost: { flights: 500, hotels: 300, food: 150, activities: 100, total: 1050 }
      });
      return res.status(201).json(trip);
    }

    const prompt = `
      You are an expert travel planner. I need a ${days}-day itinerary for ${destination}.
      Preferences: ${preferences.join(', ')}. Budget Level: ${budget}.
      
      To help make this highly authentic, here is some training data from experienced travelers who previously visited this destination (if available):
      ${existingTripsText}
      
      Using the existing itineraries as inspiration (or your own knowledge if none exist), generate a day-by-day itinerary.
      Respond with ONLY a JSON object in this format (no markdown):
      {
        "itinerary": [
          {
            "day": 1,
            "activities": [
              {
                "time": "09:00 AM",
                "title": "Activity Title",
                "description": "Activity description",
                "location": "Location name",
                "cost": 50
              }
            ]
          }
        ],
        "estimatedCost": {
          "flights": 0,
          "hotels": 0,
          "food": 0,
          "activities": 0,
          "total": 0
        }
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    let suggestionStr = response.choices[0].message.content.trim();
    if (suggestionStr.startsWith('\`\`\`json')) suggestionStr = suggestionStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    if (suggestionStr.startsWith('\`\`\`')) suggestionStr = suggestionStr.replace(/\`\`\`/g, '');
    
    const parsedData = JSON.parse(suggestionStr);

    const trip = await Trip.create({
      user: req.user.id,
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      preferences,
      itinerary: parsedData.itinerary || [],
      estimatedCost: parsedData.estimatedCost || { flights: 0, hotels: 0, food: 0, activities: 0, total: 0 }
    });

    res.status(201).json(trip);

  } catch (error) {
    console.error('Error generating AI itinerary:', error);
    res.status(500).json({ message: 'Error generating AI itinerary' });
  }
};

// @desc    Update itinerary via chat prompt using AI
// @route   POST /api/trips/:id/chat
// @access  Private
export const chatUpdateTrip = async (req, res) => {
  const { prompt } = req.body;
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
      // Mock response for testing
      return res.status(200).json(trip);
    }

    const aiPrompt = `
      You are an expert travel planner modifying an existing itinerary.
      The user request is: "${prompt}"
      
      The current itinerary is:
      ${JSON.stringify(trip.itinerary)}
      
      Modify the itinerary based on the user's request. 
      Respond ONLY with the updated JSON array of days (no markdown, no extra text):
      [
        {
          "day": 1,
          "activities": [ ... ]
        }
      ]
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: aiPrompt }],
      temperature: 0.7,
    });

    let suggestionStr = response.choices[0].message.content.trim();
    if (suggestionStr.startsWith('\`\`\`json')) suggestionStr = suggestionStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    if (suggestionStr.startsWith('\`\`\`')) suggestionStr = suggestionStr.replace(/\`\`\`/g, '');
    
    const parsedItinerary = JSON.parse(suggestionStr);
    trip.itinerary = parsedItinerary;
    await trip.save();
    
    res.json(trip);
  } catch (error) {
    console.error('Error in chat update:', error);
    res.status(500).json({ message: 'Error processing chat request' });
  }
};

// @desc    Generate a packing list using AI
// @route   POST /api/trips/:id/packing-list
// @access  Private
export const generatePackingList = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
      trip.packingList = ["Passport", "Clothes", "Toiletries", "Camera", "Chargers"];
      await trip.save();
      return res.status(200).json(trip);
    }

    const prompt = `
      Act as an expert travel assistant.
      Destination: ${trip.destination}
      Duration: ${Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} days
      Travelers: ${trip.travelers}
      Preferences: ${trip.preferences.join(', ')}
      
      Generate a practical packing list. 
      Respond ONLY with a JSON array of strings (no markdown):
      ["Item 1", "Item 2", "Item 3"]
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    let suggestionStr = response.choices[0].message.content.trim();
    if (suggestionStr.startsWith('\`\`\`json')) suggestionStr = suggestionStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    if (suggestionStr.startsWith('\`\`\`')) suggestionStr = suggestionStr.replace(/\`\`\`/g, '');
    
    const parsedList = JSON.parse(suggestionStr);
    trip.packingList = parsedList;
    await trip.save();
    
    res.json(trip);
  } catch (error) {
    console.error('Error generating packing list:', error);
    res.status(500).json({ message: 'Error generating packing list' });
  }
};

// @desc    Get all shared trips for community feed
// @route   GET /api/trips/community/all
// @access  Public
export const getCommunityTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ isShared: true }).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Error fetching community trips:', error);
    res.status(500).json({ message: 'Error fetching community trips' });
  }
};

// @desc    Get mock live deals for a trip
// @route   GET /api/trips/:id/deals
// @access  Private
export const getLiveDeals = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Generate mock flight and hotel deals based on destination
    const mockDeals = {
      flights: [
        { airline: 'Emirates', price: 450, time: '10:00 AM - 2:00 PM', stops: 'Non-stop' },
        { airline: 'Qatar Airways', price: 380, time: '6:00 AM - 1:00 PM', stops: '1 Stop' }
      ],
      hotels: [
        { name: 'Grand Plaza Hotel', pricePerNight: 120, rating: 4.8 },
        { name: 'Seaside Resort', pricePerNight: 200, rating: 4.5 }
      ]
    };
    
    // Artificial delay to simulate API call
    setTimeout(() => {
      res.json(mockDeals);
    }, 1500);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

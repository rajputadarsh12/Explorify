import Trip from '../models/Trip.js';

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
    // Make sure user owns the trip
    if (trip.user.toString() !== req.user.id) {
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
    const { itinerary, estimatedCost } = req.body;
    let trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if user owns the trip (or is a collaborator if we add that later)
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    trip.itinerary = itinerary || trip.itinerary;
    trip.estimatedCost = estimatedCost || trip.estimatedCost;
    
    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  trips: [],
  currentTrip: null,
  liveDeals: null,
  isDealsLoading: false,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Generate a new trip
export const generateTrip = createAsyncThunk('trips/generate', async (tripData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/trips/generate`, tripData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Create an empty trip shell
export const createTripItinerary = createAsyncThunk('trips/create', async (tripData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/trips/create`, tripData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Suggest a destination using AI
export const suggestDestination = createAsyncThunk('trips/suggest', async (tripData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/trips/suggest`, tripData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get user trips
export const getTrips = createAsyncThunk('trips/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${import.meta.env.VITE_API_URL || ""}/api/trips`, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get a single trip
export const getTripById = createAsyncThunk('trips/getSingle', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}`, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Toggle share status
export const toggleShareTrip = createAsyncThunk('trips/toggleShare', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}/share`, {}, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get a shared trip
export const getSharedTrip = createAsyncThunk('trips/getShared', async (id, thunkAPI) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL || ""}/api/trips/shared/${id}`);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Save a shared trip to personal account
export const cloneSharedTrip = createAsyncThunk('trips/clone', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}/save`, {}, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteTrip = createAsyncThunk('trips/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}`, config);
    return response.data; // returns { id }
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateTrip = createAsyncThunk('trips/update', async ({ id, tripData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}`, tripData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const saveSharedTrip = createAsyncThunk('trips/saveShared', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}/save`, {}, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const chatUpdateTrip = createAsyncThunk('trips/chat', async ({ id, prompt }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}/chat`, { prompt }, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const generatePackingList = createAsyncThunk('trips/packingList', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}/packing-list`, {}, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getCommunityTrips = createAsyncThunk('trips/getCommunity', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL || ""}/api/trips/community/all`);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const uploadTripImage = createAsyncThunk('trips/uploadImage', async ({ id, file }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}/upload`, formData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchLiveDeals = createAsyncThunk('trips/fetchDeals', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${import.meta.env.VITE_API_URL || ""}/api/trips/${id}/deals`, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const tripSlice = createSlice({
  name: 'trip',
  initialState: {
    trips: [],
    currentTrip: null,
    liveDeals: null,
    isDealsLoading: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetTripState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearCurrentTrip: (state) => {
      state.currentTrip = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTrip = action.payload;
        state.trips.unshift(action.payload);
      })
      .addCase(generateTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createTripItinerary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTripItinerary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips.push(action.payload);
        state.currentTrip = action.payload;
      })
      .addCase(createTripItinerary.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(suggestDestination.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(suggestDestination.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(suggestDestination.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTrips.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = action.payload;
      })
      .addCase(getTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTripById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTripById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTrip = action.payload;
      })
      .addCase(getTripById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(toggleShareTrip.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.currentTrip = action.payload;
      })
      .addCase(getSharedTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cloneSharedTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips.push(action.payload);
      })
      .addCase(cloneSharedTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = state.trips.filter((trip) => trip._id !== action.payload.id);
        if (state.currentTrip && state.currentTrip._id === action.payload.id) {
          state.currentTrip = null;
        }
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTrip = action.payload;
        const index = state.trips.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSharedTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTrip = action.payload;
      })
      .addCase(getSharedTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(saveSharedTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveSharedTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips.unshift(action.payload); // Add the newly saved trip to the user's trips list
      })
      .addCase(saveSharedTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(chatUpdateTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(chatUpdateTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTrip = action.payload;
        const index = state.trips.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
      })
      .addCase(chatUpdateTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(generatePackingList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generatePackingList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTrip = action.payload;
      })
      .addCase(generatePackingList.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCommunityTrips.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCommunityTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = action.payload; // For community, we'll store them in trips array or a separate communityTrips array?
        // Let's use the main trips array but ensure components filter or know it's community.
        // Actually, it's better to store it separately so it doesn't overwrite user trips.
      })
      .addCase(getCommunityTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(uploadTripImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadTripImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTrip = action.payload;
      })
      .addCase(fetchLiveDeals.pending, (state) => {
        state.isDealsLoading = true;
      })
      .addCase(fetchLiveDeals.fulfilled, (state, action) => {
        state.isDealsLoading = false;
        state.liveDeals = action.payload;
      })
      .addCase(fetchLiveDeals.rejected, (state, action) => {
        state.isDealsLoading = false;
      });
  },
});

export const { resetTripState, clearCurrentTrip } = tripSlice.actions;
export default tripSlice.reducer;

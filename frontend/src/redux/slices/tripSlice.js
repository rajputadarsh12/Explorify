import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  trips: [],
  currentTrip: null,
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
    const response = await axios.post('http://localhost:5000/api/trips/generate', tripData, config);
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
    const response = await axios.post('http://localhost:5000/api/trips/create', tripData, config);
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
    const response = await axios.get('http://localhost:5000/api/trips', config);
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
    const response = await axios.get(`http://localhost:5000/api/trips/${id}`, config);
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
    const response = await axios.put(`http://localhost:5000/api/trips/${id}/share`, {}, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get a shared trip
export const getSharedTrip = createAsyncThunk('trips/getShared', async (id, thunkAPI) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/trips/shared/${id}`);
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
    const response = await axios.post(`http://localhost:5000/api/trips/${id}/save`, {}, config);
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
    const response = await axios.delete(`http://localhost:5000/api/trips/${id}`, config);
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
    const response = await axios.put(`http://localhost:5000/api/trips/${id}`, tripData, config);
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
    const response = await axios.post(`http://localhost:5000/api/trips/${id}/save`, {}, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const tripSlice = createSlice({
  name: 'trip',
  initialState,
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
      });
  },
});

export const { resetTripState, clearCurrentTrip } = tripSlice.actions;
export default tripSlice.reducer;

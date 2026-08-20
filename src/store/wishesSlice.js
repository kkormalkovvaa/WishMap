import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, uploadPost, uploadPut } from "../utils/api";
import { logout as authLogout } from "./authSlice";

export const fetchWishes = createAsyncThunk("wishes/fetchWishes", async () => {
  const data = await api.get("/wishes");
  return data;
});

export const createWish = createAsyncThunk(
  "wishes/createWish",
  async (payload, { rejectWithValue }) => {
    try {
      if (payload instanceof FormData) {
        return await uploadPost("/wishes", payload);
      }
      const data = await api.post("/wishes", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const updateWish = createAsyncThunk(
  "wishes/updateWish",
  async ({ id, ...patch }, { rejectWithValue }) => {
    try {
      if (patch.formData instanceof FormData) {
        return await uploadPut(`/wishes/${id}`, patch.formData);
      }
      const data = await api.put(`/wishes/${id}`, patch);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const deleteWish = createAsyncThunk(
  "wishes/deleteWish",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/wishes/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// ------------------------------------------------------------------
// Slice
// ------------------------------------------------------------------

const initialState = {
  wishes: [],
  loading: false,
  error: null,
  selectedWish: null,
  _loaded: false,
};

const wishesSlice = createSlice({
  name: "wishes",
  initialState,
  reducers: {
    selectWish: (state, action) => {
      state.selectedWish = action.payload;
    },
    clearSelectedWish: (state) => {
      state.selectedWish = null;
    },
  },
  extraReducers: (builder) => {
    // -- fetchWishes --
    builder
      .addCase(fetchWishes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishes.fulfilled, (state, action) => {
        state.loading = false;
        state.wishes = action.payload;
        state.error = null;
        state._loaded = true;
      })
      .addCase(fetchWishes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Не удалось загрузить желания";
      });

    // -- createWish --
    builder
      .addCase(createWish.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWish.fulfilled, (state, action) => {
        state.loading = false;
        state.wishes.push(action.payload);
        state.error = null;
      })
      .addCase(createWish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Не удалось создать желание";
      });

    // -- updateWish --
    builder
      .addCase(updateWish.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWish.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.wishes.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.wishes[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateWish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Не удалось обновить желание";
      });

    // -- deleteWish --
    builder
      .addCase(deleteWish.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWish.fulfilled, (state, action) => {
        state.loading = false;
        state.wishes = state.wishes.filter((w) => w.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteWish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Не удалось удалить желание";
      });

    // -- auth logout: clear wishes on sign-out --
    builder.addCase(authLogout, (state) => {
      state.wishes = [];
      state.selectedWish = null;
      state._loaded = false;
      state.error = null;
    });
  },
});

// ------------------------------------------------------------------
// Selectors
// ------------------------------------------------------------------

export const { selectWish, clearSelectedWish } = wishesSlice.actions;
export default wishesSlice.reducer;

/** All wish IDs — useful for quick existence checks. */
export const selectWishIds = (state) => state.wishes.wishes.map((w) => w.id);

/** The full array of wishes. */
export const selectAllWishes = (state) => state.wishes.wishes;

/** Currently selected wish object (or null). */
export const selectSelectedWish = (state) => state.wishes.selectedWish;

/** True while any async thunk is pending. */
export const selectLoading = (state) => state.wishes.loading;

/** Last error message, or null. */
export const selectError = (state) => state.wishes.error;

/** Wishes filtered by status string (e.g. "active", "completed"). */
export const selectWishesByStatus = (status) => (state) =>
  state.wishes.wishes.filter((w) => w.status === status);

/** Wishes matching a category id. */
export const selectWishesByCategory = (categoryId) => (state) =>
  state.wishes.wishes.filter(
    (w) => String(w.categoryId) === String(categoryId),
  );

/** Wishes matching a search keyword in title or description. */
export const selectWishesBySearch = (keyword) => (state) => {
  const q = keyword.toLowerCase().trim();
  if (!q) return state.wishes.wishes;
  return state.wishes.wishes.filter(
    (w) =>
      w.title.toLowerCase().includes(q) ||
      (w.description ?? "").toLowerCase().includes(q),
  );
};

/** Combined filter: search + category. */
export const selectFilteredWishes =
  ({ search, category }) =>
  (state) => {
    let result = state.wishes.wishes;

    if (category && category !== "all") {
      result = result.filter((w) => String(w.categoryId) === String(category));
    }

    const q = (search ?? "").toLowerCase().trim();
    if (q) {
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          (w.description ?? "").toLowerCase().includes(q),
      );
    }

    return result;
  };

/** Counts grouped by status. */
export const selectStatusCounts = (state) => {
  const counts = { active: 0, in_progress: 0, completed: 0, canceled: 0 };
  for (const w of state.wishes.wishes) {
    if (w.status in counts) counts[w.status]++;
  }
  return counts;
};

/** Average priority across all wishes. */
export const selectAvgPriority = (state) => {
  const list = state.wishes.wishes;
  if (list.length === 0) return 0;
  return list.reduce((sum, w) => sum + (w.priority ?? 3), 0) / list.length;
};

/** Completion rate (percentage of wishes that are completed). */
export const selectCompletionRate = (state) => {
  const list = state.wishes.wishes;
  if (list.length === 0) return 0;
  return Math.round(
    (list.filter((w) => w.status === "completed").length / list.length) * 100,
  );
};

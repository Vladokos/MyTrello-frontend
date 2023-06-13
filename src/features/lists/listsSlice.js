import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {axiosInstance} from "../../config";

const initialState = {
  lists: [],
  status: "idle",
};

export const getLists = createAsyncThunk("lists/getLists", async (boardId) => {
  const response = await axiosInstance({
    config: {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
    method: "POST",
    url: "/board/lists/get",
    data: {
      boardId,
    },
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  return response;
});

export const getList = createAsyncThunk("lists/getList", async (listId) => {
  const response = await axiosInstance({
    config: {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
    method: "POST",
    url: "/board/lists/getOne",
    data: {
      listId,
    },
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  return response;
});

export const addList = createAsyncThunk(
  "lists/addList",
  async ({ nameList, boardId }) => {
    const response = await axiosInstance({
      config: {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
      method: "POST",
      url: "/board/list/create",
      data: {
        nameList,
        boardId,
      },
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return response;
  }
);

// change the name
export const changeCards = createAsyncThunk(
  "lists/changeCardsPosition",
  async ({ fromListId, toListId, position, cardId }) => {
    const response = await axiosInstance({
      config: {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
      method: "POST",
      url: "/board/list/card/move",
      data: {
        fromListId,
        toListId,
        position,
        cardId,
      },
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return response;
  }
);

export const changeName = createAsyncThunk(
  "lists/changeName",
  async ({ listId, nameList }) => {
    const response = await axiosInstance({
      config: {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
      method: "POST",
      url: "/board/list/changeName",
      data: {
        listId,
        nameList,
      },
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return response;
  }
);

export const deleteList = createAsyncThunk(
  "lists/delete",
  async ({ listId }) => {
    const response = await axiosInstance({
      config: {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
      method: "POST",
      url: "/board/list/delete",
      data: {
        listId,
      },
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return response;
  }
);

export const archiveList = createAsyncThunk(
  "lists/archive",
  async ({ listId }) => {
    const response = await axiosInstance({
      config: {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
      method: "POST",
      url: "/board/list/archive",
      data: {
        listId,
      },
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return response;
  }
);

export const unarchiveList = createAsyncThunk(
  "lists/unarchive",
  async ({ listId }) => {
    const response = await axiosInstance({
      config: {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
      method: "POST",
      url: "/board/list/unarchive",
      data: {
        listId,
      },
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return response;
  }
);

const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {
    sortingLists(state, action) {
      if (state.lists[0]?.boardId) {
        function getUsedBoard() {
          for (let i = 0; i < action.payload.length; i++) {
            if (action.payload[i]._id === state.lists[0].boardId) {
              return action.payload[i].lists;
            }
          }
        }

        const orderLists = getUsedBoard();
        
        let result = [];

        for (let i = 0; i < orderLists.length; i++) {
          for (let j = 0; j < state.lists.length; j++) {
            if (orderLists[i] === state.lists[j]._id) {
              result.push(state.lists[j]);
            }
          }
        }

        state.lists = result;
      }
    },
    removeList(state, action) {
      const listId = action.payload;

      for (let i = 0; i < state.lists.length; i++) {
        if (state.lists[i]._id === listId) {
          state.lists.splice(i, 1);
        }
      }
    }
  },
  extraReducers(builder) {
    builder
      .addCase(getLists.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getLists.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.lists = action.payload;
      })
      .addCase(getList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getList.fulfilled, (state, action) => {
        state.status = "succeeded";

        const listId = action.payload._id;

        for (let i = 0; i < state.lists.length; i++) {
          if (state.lists[i]._id === listId) {
            state.lists.splice(i, 1, action.payload);
          }
        }
      })
      .addCase(addList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(addList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lists.push(action.payload);
      })
      .addCase(changeCards.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(changeCards.fulfilled, (state, action) => {
        state.status = "succeeded";

        const { oldList, newList } = action.payload;

        if (newList === undefined) {
          for (let i = 0; i < state.lists.length; i++) {
            if (state.lists[i]._id === oldList._id) {
              state.lists[i] = oldList;
            }
          }
        } else {
          for (let i = 0; i < state.lists.length; i++) {
            if (state.lists[i]._id === oldList._id) {
              state.lists[i] = oldList;
            }
            if (state.lists[i]._id === newList._id) {
              state.lists[i] = newList;
            }
          }
        }
      })
      .addCase(changeName.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(changeName.fulfilled, (state, action) => {
        state.status = "succeeded";

        const { listId, nameList } = action.payload;

        for (let i = 0; i < state.lists.length; i++) {
          if (state.lists[i]._id === listId) {
            state.lists[i].nameList = nameList;
          }
        }
      })
      .addCase(deleteList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.status = "succeeded";

        const { listId } = action.payload;

        for (let i = 0; i < state.lists.length; i++) {
          if (state.lists[i]._id === listId) {
            state.lists.splice(i, 1);
          }
        }
      })
      .addCase(archiveList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(archiveList.fulfilled, (state, action) => {
        state.status = "succeeded";

        const { listId } = action.payload;

        for (let i = 0; i < state.lists.length; i++) {
          if (state.lists[i]._id === listId) {
            state.lists[i].archived = true;
          }
        }
      })
      .addCase(unarchiveList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(unarchiveList.fulfilled, (state, action) => {
        state.status = "succeeded";

        const { listId } = action.payload;

        for (let i = 0; i < state.lists.length; i++) {
          if (state.lists[i]._id === listId) {
            state.lists[i].archived = false;
          }
        }
      });
  },
});

export const { sortingLists, removeList } = listsSlice.actions;

export default listsSlice.reducer;

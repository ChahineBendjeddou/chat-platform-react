import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  deleteMessage as deleteMessageAPI,
  editMessage as editMessageAPI,
  getConversationMessages,
} from '../utils/api';
import {
  ConversationMessage,
  DeleteMessageParams,
  DeleteMessageResponse,
  EditMessagePayload,
  MessageEventPayload,
  MessageType,
} from '../utils/types';

export interface MessagesState {
  messages: ConversationMessage[];
  loading: boolean;
}

const initialState: MessagesState = {
  messages: [],
  loading: false,
};

export const fetchMessagesThunk = createAsyncThunk(
  'messages/fetch',
  (id: number) => {
    return getConversationMessages(id);
  }
);

export const deleteMessageThunk = createAsyncThunk(
  'messages/delete',
  (params: DeleteMessageParams) => {
    return deleteMessageAPI(params);
  }
);

export const editMessageThunk = createAsyncThunk(
  'messages/edit',
  (params: EditMessagePayload) => {
    return editMessageAPI(params);
  }
);

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<MessageEventPayload>) => {
      console.log(state);
      console.log(action);
      const { conversation, message } = action.payload;
      const conversationMessage = state.messages.find(
        (cm) => cm.id === conversation.id
      );
      conversationMessage?.messages.unshift(message);
    },
    deleteMessage: (state, action: PayloadAction<DeleteMessageResponse>) => {
      console.log('Inside deleteMessage reducer');
      const { payload } = action;
      const conversationMessages = state.messages.find(
        (cm) => cm.id === payload.conversationId
      );
      if (!conversationMessages) return;
      const messageIndex = conversationMessages.messages.findIndex(
        (m) => m.id === payload.messageId
      );
      console.log(conversationMessages);
      console.log(messageIndex);
      console.log(payload);
      conversationMessages.messages.splice(messageIndex, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        const { id, messages } = action.payload.data;
        const index = state.messages.findIndex((cm) => cm.id === id);
        const exists = state.messages.find((cm) => cm.id === id);
        if (exists) {
          console.log('exists');
          state.messages[index] = action.payload.data;
        } else {
          state.messages.push(action.payload.data);
        }
      })
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        const { data } = action.payload;
        const conversationMessages = state.messages.find(
          (cm) => cm.id === data.conversationId
        );
        if (!conversationMessages) return;
        const messageIndex = conversationMessages.messages.findIndex(
          (m) => m.id === data.messageId
        );
        conversationMessages?.messages.splice(messageIndex, 1);
      })
      .addCase(editMessageThunk.fulfilled, (state, action) => {
        console.log('editMessageThunk.fulfilled');
        const { data: message } = action.payload;
        const { id } = message.conversation;
        const conversationMessage = state.messages.find((cm) => cm.id === id);
        if (!conversationMessage) return;
        const messageIndex = conversationMessage.messages.findIndex(
          (m) => m.id === message.id
        );
        console.log(messageIndex);
        conversationMessage.messages[messageIndex] = message;
        console.log('Updated Message');
      });
  },
});

export const { addMessage, deleteMessage } = messagesSlice.actions;

export default messagesSlice.reducer;

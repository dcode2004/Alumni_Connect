"use client";
import { app } from "../../firebase/firebase";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const db = getFirestore(app);

// ensure group chat for batch exists and return chat doc ref/data
export const ensureBatchGroupChat = async (batchNum, currentUser) => {
  try {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("type", "==", "group"),
      where("batchNum", "==", batchNum)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }

    // create group chat
    const newChat = {
      type: "group",
      title: `Batch ${batchNum} Chat`,
      members: [],
      batchNum,
      createdAt: serverTimestamp(),
      lastMessage: null,
    };
    const created = await addDoc(chatsRef, newChat);
    // optionally add members lazily when users open chat
    return { id: created.id, ...newChat };
  } catch (error) {
    console.error("ensureBatchGroupChat error", error);
    throw error;
  }
};

export const getUserChatsOnce = async (userId) => {
  try {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("members", "array-contains", userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("getUserChatsOnce error", error);
    return [];
  }
};

export const subscribeToChatMessages = (chatId, cb) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(msgs);
    });
  } catch (error) {
    console.error("subscribeToChatMessages error", error);
    return () => {};
  }
};

export const sendMessage = async (chatId, senderId, text, senderName = "") => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const msg = {
      senderId,
      senderName: senderName || "User",
      text,
      createdAt: serverTimestamp(),
    };
    const created = await addDoc(messagesRef, msg);
    // update lastMessage on chat
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: { text, senderId, createdAt: serverTimestamp() },
    });
    return { id: created.id, ...msg };
  } catch (error) {
    console.error("sendMessage error", error);
    throw error;
  }
};

// create or get private chat between two users
export const getOrCreatePrivateChat = async (currentUserId, targetUser) => {
  try {
    const chatsRef = collection(db, "chats");
    // find chats containing currentUserId and then filter
    const q = query(
      chatsRef,
      where("members", "array-contains", currentUserId)
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const data = d.data();
      if (
        data.type === "private" &&
        Array.isArray(data.members) &&
        data.members.includes(targetUser._id)
      ) {
        return { id: d.id, ...data };
      }
    }

    // create new private chat
    const chatData = {
      type: "private",
      title: `${targetUser.userDetails?.name || targetUser.email}`,
      members: [currentUserId, targetUser._id],
      createdAt: serverTimestamp(),
      lastMessage: null,
    };
    const created = await addDoc(chatsRef, chatData);
    return { id: created.id, ...chatData };
  } catch (error) {
    console.error("getOrCreatePrivateChat error", error);
    throw error;
  }
};

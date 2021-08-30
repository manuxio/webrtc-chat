const initialState = {
  "0001": {
    _id: "001",
    participants: ["002","003"],
    type: "single",
    lastMessage: {
      _id: "009",
      from: "003",
      message: "Ciao",
      date: new Date()
    }
  },
  "0004": {
    _id: "0004",
    participants: ["003","004"],
    type: "single"
  }
};

export default function chatrooms(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
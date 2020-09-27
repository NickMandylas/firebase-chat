import React from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: "react-chat-app-1a051.firebaseapp.com",
	databaseURL: "https://react-chat-app-1a051.firebaseio.com",
	projectId: "react-chat-app-1a051",
	storageBucket: "react-chat-app-1a051.appspot.com",
	messagingSenderId: "50696732777",
	appId: "1:50696732777:web:66c0f7ac24532448ee22f8",
	measurementId: "G-HV30L5ESBL",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
	const [user] = useAuthState(auth);

	return (
		<div className="App">
			<header>
				<h1>
					Typescript
					<span
						style={{ marginLeft: 10 }}
						role="img"
						aria-label="React Firebase Chat"
					>
						⚛️🔥💬
					</span>
				</h1>
				<SignOut />
			</header>
			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	);
}

type FirebaseMessage = {
	id: string;
	uid: string;
	text: string;
	photoURL: string;
};

const ChatRoom: React.FC = () => {
	const messagesRef = firestore.collection("messages");
	const query = messagesRef.orderBy("createdAt").limit(25);

	const [messages] = useCollectionData(query, { idField: "id" });

	const [formValue, setFormValue] = React.useState<string>("");

	const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (auth.currentUser) {
			const { uid, photoURL } = auth.currentUser;

			await messagesRef.add({
				text: formValue,
				createdAt: firebase.firestore.FieldValue.serverTimestamp(),
				uid,
				photoURL,
			});

			setFormValue("");
		}
	};

	return (
		<>
			<div>
				{messages &&
					messages.map((msg: any) => (
						<ChatMessage key={msg.id} message={msg} />
					))}
			</div>
			<form onSubmit={sendMessage}>
				<input
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
				/>
				<button type="submit">Send</button>
			</form>
		</>
	);
};

interface ChatMessageProps {
	key: string;
	message: FirebaseMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = (props) => {
	const { text, uid, photoURL } = props.message;

	const messageClass = uid === auth.currentUser?.uid ? "sent" : "received";

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} alt={`${auth.currentUser?.displayName}`} />
			<p>{text}</p>
		</div>
	);
};

const SignIn: React.FC = () => {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	};

	return <button onClick={signInWithGoogle}>Sign in with Google</button>;
};

const SignOut: React.FC = () => {
	return (
		auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
	);
};

export default App;

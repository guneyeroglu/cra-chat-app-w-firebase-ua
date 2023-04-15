import { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { nanoid } from 'nanoid';
import { SendSvg } from './assets/svg/index';

import './global.scss';

firebase.initializeApp({
  apiKey: 'AIzaSyA5_F4umehRxcNW3lvFpmEeTTpTkiF1UIo',
  authDomain: 'chat-app-uretken-a.firebaseapp.com',
  projectId: 'chat-app-uretken-a',
  storageBucket: 'chat-app-uretken-a.appspot.com',
  messagingSenderId: '760333182667',
  appId: '1:760333182667:web:7d14a46721bd4904e85d4e',
  measurementId: 'G-E00XXE3XTW',
});

const auth = firebase.auth();
const firestore = firebase.firestore();

const App = () => {
  const [user] = useAuthState(auth);

  return <div className='wrapper'>{user ? <ChatRoom /> : <SignIn />}</div>;
};

export default App;

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <div className='sign-in-btn'>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
};

const SignOut = () => {
  const signOutApp = () => {
    auth.signOut();
  };
  return (
    <div className='sign-out-btn'>
      <button onClick={signOutApp}>Sign out</button>
    </div>
  );
};

const ChatRoom = () => {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query);
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    setFormValue('');

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      id: nanoid(),
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      displayName,
      uid,
      photoURL,
    });
  };

  return (
    <div className='wrapper__room'>
      <div className='chat'>
        <div className='chat__messages'>
          {!!messages?.length ? (
            messages.map((message) => <ChatMessage key={message.id} message={message} />)
          ) : (
            <div className='no-messages'>
              <span>No messages</span>
            </div>
          )}
        </div>
        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={({ target }) => setFormValue(target.value)} />
          <button type='submit'>{<SendSvg />}</button>
        </form>
      </div>
      <SignOut />
    </div>
  );
};

const ChatMessage = (props) => {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt='user' />
      <div className='message__text'>
        <p>{displayName}</p>
        <span>{text}</span>
      </div>
    </div>
  );
};

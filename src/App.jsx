import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { signOut } from 'firebase/auth';
import { auth, db } from './services/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';

function Home() {
  const [utilisateur, setUtilisateur] = useState(null);
  const [profil, setProfil] = useState(null);
  const [tweet, setTweet] = useState('');
  const [tweets, setTweets] = useState([]);
  const [reponse, setReponse] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUtilisateur(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!utilisateur) {
      return;
    }

    const profilRef = doc(db, 'users', utilisateur.uid);

    const unsubscribe = onSnapshot(profilRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfil(snapshot.data());
      }
    });

    return () => unsubscribe();
  }, [utilisateur]);

  useEffect(() => {
    const tweetsRef = collection(db, 'tweets');
    const tweetsQuery = query(tweetsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(tweetsQuery, (snapshot) => {
      const tweetsFirebase = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      setTweets(tweetsFirebase);
    });

    return () => unsubscribe();
  }, []);

  async function publierTweet() {
    if (!utilisateur || tweet.trim() === '') {
      return;
    }

    try {
      await addDoc(collection(db, 'tweets'), {
        auteurUid: utilisateur.uid,
        auteur: profil?.nom || utilisateur.email,
        contenu: tweet.trim(),
        reponses: [],
        createdAt: new Date(),
      });

      setTweet('');
    } catch (error) {
      console.error('Erreur lors de la publication :', error);
    }
  }

  async function supprimerTweet(id) {
    try {
      await deleteDoc(doc(db, 'tweets', id));
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
    }
  }

  async function repondreTweet(id) {
    if (reponse.trim() === '') {
      return;
    }

    const tweetActuel = tweets.find((tweet) => tweet.id === id);

    if (!tweetActuel || !utilisateur) {
      return;
    }

    const nouvelleReponse = {
      id: Date.now(),
      auteurUid: utilisateur.uid,
      auteur: profil?.nom || utilisateur.email,
      contenu: reponse.trim(),
    };

    const nouvellesReponses = [
      ...(tweetActuel.reponses || []),
      nouvelleReponse,
    ];

    try {
      await updateDoc(doc(db, 'tweets', id), {
        reponses: nouvellesReponses,
      });

      setReponse('');
    } catch (error) {
      console.error('Erreur lors de la réponse :', error);
    }
  }

  function seDeconnecter() {
    signOut(auth);
  }

  const following = profil?.following || [];

  const tweetsVisibles = tweets.filter((tweet) => {
    if (!utilisateur) {
      return false;
    }

    if (!tweet.auteurUid) {
      return false;
    }

    return (
      tweet.auteurUid === utilisateur.uid ||
      following.includes(tweet.auteurUid)
    );
  });

  return (
    <>
      <nav>
        <h1>Twitter Clone</h1>

        <div>
          <Link to="/">
            <button>Accueil</button>
          </Link>

          {utilisateur ? (
            <>
              <Link to="/profile">
                <button>Mon profil</button>
              </Link>

              <button onClick={seDeconnecter}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button>Connexion</button>
              </Link>

              <Link to="/register">
                <button>Créer un compte</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <main>
        {!utilisateur ? (
          <section>
            <h2>Bienvenue sur Twitter Clone</h2>
            <p>Connecte-toi pour publier et voir les tweets.</p>
          </section>
        ) : (
          <>
            <section>
              <h2>Accueil</h2>

              <textarea
                placeholder="Quoi de neuf ?"
                value={tweet}
                onChange={(e) => setTweet(e.target.value)}
                rows="4"
              />

              <button onClick={publierTweet}>Publier</button>
            </section>

            <section>
              <h2>Fil d'actualité</h2>

              {tweetsVisibles.length === 0 ? (
                <p>
                  Aucun tweet pour le moment. Suis un utilisateur ou publie
                  ton premier tweet !
                </p>
              ) : (
                tweetsVisibles.map((tweet) => (
                  <article key={tweet.id}>
                    <p>
                      <strong>{tweet.auteur}</strong>
                    </p>

                    <p>{tweet.contenu}</p>

                    {tweet.auteurUid === utilisateur.uid && (
                      <button onClick={() => supprimerTweet(tweet.id)}>
                        Supprimer
                      </button>
                    )}

                    <div>
                      <input
                        type="text"
                        placeholder="Répondre..."
                        value={reponse}
                        onChange={(e) => setReponse(e.target.value)}
                      />

                      <button onClick={() => repondreTweet(tweet.id)}>
                        Répondre
                      </button>
                    </div>

                    {(tweet.reponses || []).map((rep) => (
                      <p key={rep.id}>
                        <strong>{rep.auteur} :</strong> {rep.contenu}
                      </p>
                    ))}
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:uid" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

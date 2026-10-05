import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';

function Profile() {
  const { uid } = useParams();

  const [utilisateur, setUtilisateur] = useState(null);
  const [profil, setProfil] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUtilisateur(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!utilisateur) {
      return;
    }

    const profilUid = uid || utilisateur.uid;
    const profilRef = doc(db, 'users', profilUid);

    const unsubscribeProfil = onSnapshot(profilRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfil(snapshot.data());
      } else {
        setProfil(null);
      }
    });

    return () => unsubscribeProfil();
  }, [utilisateur, uid]);

  useEffect(() => {
    const usersRef = collection(db, 'users');

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersFirebase = snapshot.docs.map((document) => ({
        uid: document.id,
        ...document.data(),
      }));

      setUtilisateurs(usersFirebase);
    });

    return () => unsubscribe();
  }, []);

  async function suivreUtilisateur(targetUid) {
    if (!utilisateur || targetUid === utilisateur.uid) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', utilisateur.uid), {
        following: arrayUnion(targetUid),
      });

      await updateDoc(doc(db, 'users', targetUid), {
        followers: arrayUnion(utilisateur.uid),
      });
    } catch (error) {
      console.error('Erreur lors du suivi :', error);
    }
  }

  async function nePlusSuivre(targetUid) {
    if (!utilisateur || targetUid === utilisateur.uid) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', utilisateur.uid), {
        following: arrayRemove(targetUid),
      });

      await updateDoc(doc(db, 'users', targetUid), {
        followers: arrayRemove(utilisateur.uid),
      });
    } catch (error) {
      console.error('Erreur lors du désabonnement :', error);
    }
  }

  if (!utilisateur) {
    return (
      <main>
        <section>
          <h2>Profil</h2>
          <p>Connecte-toi pour voir les profils.</p>
        </section>
      </main>
    );
  }

  if (!profil) {
    return (
      <main>
        <section>
          <p>Chargement du profil...</p>
        </section>
      </main>
    );
  }

  const followers = profil.followers || [];
  const following = profil.following || [];

  const estMonProfil = (uid || utilisateur.uid) === utilisateur.uid;
  const estSuivi = following.includes(uid);

  return (
    <main>
      <section>
        <h2>{profil.nom}</h2>

        <p>
          <strong>Email :</strong> {profil.email}
        </p>

        <p>
          <strong>Abonnés :</strong> {followers.length}
        </p>

        <p>
          <strong>Abonnements :</strong> {following.length}
        </p>

        {!estMonProfil && (
          <>
            {estSuivi ? (
              <button onClick={() => nePlusSuivre(uid)}>
                Ne plus suivre
              </button>
            ) : (
              <button onClick={() => suivreUtilisateur(uid)}>
                Suivre
              </button>
            )}
          </>
        )}
      </section>

      {estMonProfil && (
        <section>
          <h2>Découvrir des utilisateurs</h2>

          {utilisateurs
            .filter((user) => user.uid !== utilisateur.uid)
            .map((user) => {
              const dejaSuivi = following.includes(user.uid);

              return (
                <article key={user.uid}>
                  <h3>{user.nom}</h3>
                  <p>{user.email}</p>

                  <Link to={`/profile/${user.uid}`}>
                    <button>Voir le profil</button>
                  </Link>

                  {dejaSuivi ? (
                    <button onClick={() => nePlusSuivre(user.uid)}>
                      Ne plus suivre
                    </button>
                  ) : (
                    <button onClick={() => suivreUtilisateur(user.uid)}>
                      Suivre
                    </button>
                  )}
                </article>
              );
            })}
        </section>
      )}
    </main>
  );
}

export default Profile;

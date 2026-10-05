import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

function Register() {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [message, setMessage] = useState('');

    async function sInscrire(e) {
        e.preventDefault();
        setMessage('');

        try {
        const resultat = await createUserWithEmailAndPassword(
            auth,
            email,
            motDePasse
        );

        await setDoc(doc(db, 'users', resultat.user.uid), {
            email: email,
            nom: email.split('@')[0],
            followers: [],
            following: [],
        });

        setMessage('Compte créé avec succès !');
        } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            setMessage('Cette adresse e-mail est déjà utilisée.');
        } else if (error.code === 'auth/weak-password') {
            setMessage('Le mot de passe doit contenir au moins 6 caractères.');
        } else {
            setMessage('Impossible de créer le compte.');
            console.error(error);
        }
        }
    }

    return (
        <main>
        <section>
            <h2>Créer un compte</h2>

            <form onSubmit={sInscrire}>
            <input
                type="email"
                placeholder="Votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Votre mot de passe"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
            />

            <button type="submit">Créer mon compte</button>
            </form>

            {message && <p>{message}</p>}
        </section>
        </main>
    );
    }

export default Register;

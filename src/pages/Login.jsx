    import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
    import { signInWithEmailAndPassword } from 'firebase/auth';
    import { auth } from '../services/firebase';

    function Login() {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [message, setMessage] = useState('');
  const navigate = useNavigate();

    async function seConnecter(e) {
        e.preventDefault();
        setMessage('');

        try {
        await signInWithEmailAndPassword(auth, email, motDePasse);
        navigate('/');
        } catch {
        setMessage('Email ou mot de passe incorrect.');
        }
    }

    return (
        <main>
        <section>
            <h2>Connexion</h2>

            <form onSubmit={seConnecter}>
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

            <button type="submit">Se connecter</button>
            </form>

            {message && <p>{message}</p>}
        </section>
        </main>
    );
    }

    export default Login;
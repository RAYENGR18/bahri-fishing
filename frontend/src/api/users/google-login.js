import { OAuth2Client } from 'google-auth-library';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// --- 1. Gestion de la connexion MongoDB (Optimisé pour Vercel) ---
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Veuillez définir la variable MONGODB_URI dans .env');
}

// On cache la connexion pour ne pas en ouvrir une nouvelle à chaque clic
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// --- 2. Définition du modèle User (Si tu ne l'as pas importé d'ailleurs) ---
// Note : En serverless, il vaut mieux définir le schéma ici ou dans un dossier partagé 'lib'
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  avatar: String,
  googleId: String,
  // Ajoute les champs dont tu as besoin
});

// Empêche l'erreur "OverwriteModelError" lors du rechargement à chaud
const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- 3. La Fonction Handler (Le cœur de Vercel) ---
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  // On autorise uniquement la méthode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // A. Connexion DB
    await connectToDatabase();

    // B. Récupération du token envoyé par ton frontend React
    const { token } = req.body;

    // C. Vérification auprès de Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, name, picture, sub } = ticket.getPayload(); // 'sub' est l'ID unique Google

    // D. Recherche ou Création de l'utilisateur dans Atlas
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        avatar: picture,
        googleId: sub,
      });
    }

    // E. Création de ton JWT (Token de session pour ton app)
    const appToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // F. Réponse au frontend
    return res.status(200).json({
      success: true,
      tokens: { access: appToken },
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Erreur Login Google:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}
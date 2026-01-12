#!/bin/bash
# Script to set Vercel environment variables
# Run this script to set all required environment variables in Vercel

echo "Setting Vercel environment variables..."

vercel env add VITE_FIREBASE_API_KEY production preview development <<< "AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw"
vercel env add VITE_FIREBASE_AUTH_DOMAIN production preview development <<< "jiome-f9f77.firebaseapp.com"
vercel env add VITE_FIREBASE_PROJECT_ID production preview development <<< "jiome-f9f77"
vercel env add VITE_FIREBASE_STORAGE_BUCKET production preview development <<< "jiome-f9f77.firebasestorage.app"
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production preview development <<< "21306379382"
vercel env add VITE_FIREBASE_APP_ID production preview development <<< "1:21306379382:web:d074f1131a73eb85122357"
vercel env add VITE_FIREBASE_MEASUREMENT_ID production preview development <<< "G-5116RR4J5Z"
vercel env add VITE_API_BASE_URL production preview development <<< "https://jiomeapp.com"

echo "✅ All environment variables set!"
echo "Now redeploy your project: vercel --prod"

#!/bin/bash
# ==================================================
# Script de déploiement FORDAC Connect (GitHub only)
# ==================================================

echo "🚀 Déploiement de FORDAC API sur GitHub..."

git add .
git commit -m "🚀 Mise à jour FORDAC API"
git push origin main

echo "✅ Push terminé !"
echo "👉 Lance ensuite ton déploiement Railway manuellement :"
echo "   railway up"

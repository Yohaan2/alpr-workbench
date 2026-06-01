#!/bin/bash

# ==============================================================================
# Script de Renovación Manual de Certificados SSL
# Dominio: alpr.optrax.io
# ==============================================================================

echo "### Renovando certificados Let's Encrypt manualmente..."
docker compose run --rm certbot renew

echo "### Recargando configuración de Nginx..."
docker compose exec nginx nginx -s reload

echo "### Proceso finalizado!"

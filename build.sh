#!/bin/bash
source config.env
npm install
docker build -t $USER/$SITE:$VERSION .

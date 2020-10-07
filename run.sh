#!/bin/bash
source config.env
docker run -p 8080:$PORT -d $USER/$SITE:$VERSION

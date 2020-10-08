#!/bin/bash
source config.env
docker push $USER/$SITE:$VERSION

#!/bin/sh

USER=tsdev
HOST=kowal.uberspace.de

rsync -av * --exclude .git -e ssh $USER@$HOST:html/fieldtrip/



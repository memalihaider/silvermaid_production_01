#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <username> <password> <url> [<file>]"
  echo "Examples:" 
  echo "  $0 myuser mypass https://www.silvermaidsdubai.com/api/media"
  echo "  $0 myuser mypass https://www.silvermaidsdubai.com/api/media /path/to/image.png"
  exit 1
fi

USER="$1"
PASS="$2"
URL="$3"
FILE="${4-}"

B64=$(printf "%s:%s" "$USER" "$PASS" | base64)
echo "Using header: Authorization: Basic ${B64}"

if [ -n "$FILE" ]; then
  echo "Uploading file: $FILE -> $URL"
  curl -v -H "Authorization: Basic ${B64}" -F "file=@${FILE}" "$URL"
else
  echo "Sending GET to $URL"
  curl -v -H "Authorization: Basic ${B64}" "$URL"
fi
